import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'api.dart';
import 'theme.dart';
import 'widgets.dart';

/// 첫 메시지는 편지로: 대화방에서 각자의 첫 메시지는 이 글자 수 이상 (서버와 같은 값)
const letterMinLength = 40;

/// 받기 전용 실시간 채널. 보내기는 REST로 한다.
/// 로그인 후 [connect], 로그아웃 때 [disconnect].
abstract final class ChatSocket {
  static io.Socket? _socket;
  static final _messages = StreamController<Map>.broadcast();
  static final _reads = StreamController<Map>.broadcast();
  static final _roomUpdates = StreamController<int>.broadcast();
  static final _reconnects = StreamController<void>.broadcast();

  /// 새 메시지 (서버 `message:new`의 message). 끝맺음 인사도 kind: farewell로 온다
  static Stream<Map> get messages => _messages.stream;

  /// 누가 어디까지 읽었는지 `{ conversationId, userId, lastReadMessageId }`
  static Stream<Map> get reads => _reads.stream;

  /// 진지한 인연 신청·응답처럼 방 상태가 바뀐 대화방 id. 방 정보를 다시 읽으면 된다
  static Stream<int> get roomUpdates => _roomUpdates.stream;

  /// 끊겼다 다시 붙은 순간. 그 사이 놓친 것은 REST로 다시 불러온다.
  static Stream<void> get reconnects => _reconnects.stream;

  static void connect() {
    disconnect();
    var first = true;
    // forceNew: 로그아웃 후 다른 계정으로 로그인해도 예전 토큰의 연결을 재사용하지 않게
    final socket = io.io(
      apiBase,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': Api.token})
          .enableForceNew()
          .disableAutoConnect()
          .build(),
    );
    socket.onConnect((_) {
      if (!first) _reconnects.add(null);
      first = false;
    });
    socket.on('message:new', (data) => _messages.add((data as Map)['message'] as Map));
    socket.on('conversation:read', (data) => _reads.add(data as Map));
    for (final event in ['serious:requested', 'serious:updated']) {
      socket.on(event, (data) => _roomUpdates.add((data as Map)['conversationId'] as int));
    }
    _socket = socket.connect();
  }

  static void disconnect() {
    _socket?.dispose();
    _socket = null;
  }
}

String _hhmm(DateTime t) => '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

/// 목록용 시간: 오늘이면 시:분, 아니면 월/일
String chatTime(String iso) {
  final t = DateTime.parse(iso).toLocal();
  final now = DateTime.now();
  if (t.year == now.year && t.month == now.month && t.day == now.day) return _hhmm(t);
  return '${t.month}/${t.day}';
}

class ChatRoomScreen extends StatefulWidget {
  const ChatRoomScreen({super.key, required this.conversationId, required this.partner, required this.meId});
  final int conversationId;
  final Map partner;
  final int meId;

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  /// 최신순. 화면은 reverse 리스트라 0번이 맨 아래.
  var _messages = <Map>[];

  /// GET /conversations/:id — 편지 필요 여부, 읽은 위치, 진지한 인연, 닫힘
  Map? _room;
  int? _nextCursor;
  var _loaded = false;
  var _loadingOlder = false;
  var _sending = false;
  int _myLastRead = 0;
  final _input = TextEditingController();
  final _scroll = ScrollController();
  late final List<StreamSubscription> _subs;

  int get _id => widget.conversationId;
  String get _path => '/conversations/$_id';
  bool get _closed => _room?['closedAt'] != null;

  @override
  void initState() {
    super.initState();
    _loadRoom();
    _loadLatest();
    _input.addListener(() => setState(() {})); // 편지 글자 수 표시
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 200) _loadOlder();
    });
    _subs = [
      ChatSocket.messages.where((m) => m['conversationId'] == _id).listen((m) {
        _merge([m]);
        if (m['senderId'] != widget.meId) _markRead();
        if (m['kind'] == 'farewell') _loadRoom();
      }),
      ChatSocket.reads.where((r) => r['conversationId'] == _id && r['userId'] != widget.meId).listen((r) {
        if (_room != null) setState(() => _room = {..._room!, 'partnerLastReadMessageId': r['lastReadMessageId']});
      }),
      ChatSocket.roomUpdates.where((id) => id == _id).listen((_) => _loadRoom()),
      ChatSocket.reconnects.listen((_) {
        _loadRoom();
        _loadLatest();
      }),
    ];
  }

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  /// 소켓·REST 응답이 같은 메시지를 두 번 줄 수 있어서 id로 합친다
  void _merge(Iterable<Map> items) {
    if (!mounted) return;
    final byId = {for (final m in _messages) m['id']: m, for (final m in items) m['id']: m};
    setState(() => _messages = byId.values.toList()..sort((a, b) => (b['id'] as int).compareTo(a['id'] as int)));
  }

  Future<void> _guard(Future<void> Function() action) async {
    try {
      await action();
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  Future<void> _loadRoom() => _guard(() async {
    final room = await Api.call('GET', _path);
    if (mounted) setState(() => _room = room);
  });

  Future<void> _loadLatest() => _guard(() async {
    final page = await Api.call('GET', '$_path/messages?limit=30');
    if (!_loaded) _nextCursor = page['nextCursor'];
    _loaded = true;
    _merge((page['items'] as List).cast());
    _markRead();
  });

  Future<void> _loadOlder() async {
    if (_nextCursor == null || _loadingOlder) return;
    _loadingOlder = true;
    await _guard(() async {
      final page = await Api.call('GET', '$_path/messages?limit=30&before=$_nextCursor');
      _nextCursor = page['nextCursor'];
      _merge((page['items'] as List).cast());
    });
    _loadingOlder = false;
  }

  /// 화면에 보이는 가장 최근 상대 메시지까지 읽음 처리
  Future<void> _markRead() async {
    final newest = _messages.where((m) => m['senderId'] != widget.meId).firstOrNull?['id'] as int?;
    if (newest == null || newest <= _myLastRead) return;
    _myLastRead = newest;
    await _guard(() => Api.call('POST', '$_path/read', {'messageId': newest}));
  }

  bool get _needsLetter => _room?['needsLetter'] == true;
  int get _letterLength => _input.text.trim().characters.length;

  Future<void> _send() async {
    final body = _input.text.trim();
    if (body.isEmpty || _sending || (_needsLetter && _letterLength < letterMinLength)) return;
    setState(() => _sending = true);
    try {
      final message = await Api.call('POST', '$_path/messages', {'body': body});
      _input.clear();
      _merge([message]);
      if (_needsLetter) setState(() => _room = {..._room!, 'needsLetter': false});
    } catch (e) {
      if (mounted) showError(context, e); // 입력한 글은 지우지 않는다
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  // ───── 메뉴: 진지한 인연, 대화 마치기, 신고, 차단 ─────

  bool get _canRequestSerious =>
      _room != null && !_closed && _room!['seriousAt'] == null && _room!['seriousRequest'] == null;

  Future<void> _requestSerious() async {
    final ok = await _confirm(
      title: '진지한 인연을 신청할까요?',
      description: '${widget.partner['nickname']}님이 수락하면 두 사람은 진지한 인연이 돼요.\n거절되면 다시 신청할 수 없어요.',
      action: '신청하기',
    );
    if (!ok) return;
    await _guard(() async {
      await Api.call('POST', '$_path/serious');
      await _loadRoom();
    });
  }

  Future<void> _respondSerious(bool accept) => _guard(() async {
    await Api.call('POST', '$_path/serious/respond', {'accept': accept});
    await _loadRoom();
  });

  Future<void> _close() async {
    final ctrl = TextEditingController();
    final farewell = await showShadDialog<String>(
      context: context,
      builder: (ctx) => ShadDialog(
        title: const Text('대화를 마칠까요?'),
        description: Text('${widget.partner['nickname']}님에게 마지막 인사를 남겨주세요.\n마친 대화는 다시 열 수 없어요.'),
        actions: [
          ShadButton.secondary(onPressed: () => Navigator.pop(ctx), child: const Text('취소')),
          ShadButton(onPressed: () => Navigator.pop(ctx, ctrl.text.trim()), child: const Text('인사 남기고 마치기')),
        ],
        child: Padding(
          padding: const .symmetric(vertical: HanaSpace.sm),
          child: ShadTextarea(controller: ctrl, placeholder: const Text('함께해서 즐거웠어요')),
        ),
      ),
    );
    if (farewell == null || farewell.isEmpty) return;
    await _guard(() async {
      _merge([await Api.call('POST', '$_path/close', {'farewell': farewell})]);
      await _loadRoom();
    });
  }

  Future<void> _report() async {
    const reasons = [
      ('spam', '스팸·광고'),
      ('harassment', '괴롭힘·욕설'),
      ('inappropriate', '부적절한 내용'),
      ('scam', '사기·금전 요구'),
      ('other', '기타'),
    ];
    var reason = 'harassment';
    final detail = TextEditingController();
    final ok = await showShadDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialog) => ShadDialog(
          title: Text('${widget.partner['nickname']}님 신고'),
          description: const Text('신고하면 이 사람은 자동으로 차단돼요'),
          actions: [
            ShadButton.secondary(onPressed: () => Navigator.pop(ctx, false), child: const Text('취소')),
            ShadButton.destructive(onPressed: () => Navigator.pop(ctx, true), child: const Text('신고하기')),
          ],
          child: Padding(
            padding: const .symmetric(vertical: HanaSpace.sm),
            child: Column(
              spacing: HanaSpace.sm,
              children: [
                for (final (value, label) in reasons)
                  ChoiceCard(
                    title: label,
                    subtitle: '',
                    selected: reason == value,
                    onTap: () => setDialog(() => reason = value),
                  ),
                ShadTextarea(controller: detail, placeholder: const Text('자세한 내용 (선택)')),
              ],
            ),
          ),
        ),
      ),
    );
    if (ok != true) return;
    await _guard(() async {
      await Api.call('POST', '/reports', {
        'userId': widget.partner['id'],
        'reason': reason,
        'detail': detail.text.trim(),
        'conversationId': _id,
      });
      _leave('신고했어요. 이 사람은 차단돼요');
    });
  }

  Future<void> _block() async {
    final ok = await _confirm(
      title: '${widget.partner['nickname']}님을 차단할까요?',
      description: '서로 메시지를 보낼 수 없고, 다시 소개되지 않아요.\n프로필 > 차단한 사람에서 해제할 수 있어요.',
      action: '차단하기',
    );
    if (!ok) return;
    await _guard(() async {
      await Api.call('POST', '/users/${widget.partner['id']}/block');
      _leave('차단했어요');
    });
  }

  void _leave(String message) {
    if (!mounted) return;
    showInfo(context, message);
    Navigator.pop(context);
  }

  Future<bool> _confirm({required String title, required String description, required String action}) async =>
      await showShadDialog<bool>(
        context: context,
        builder: (ctx) => ShadDialog(
          title: Text(title),
          description: Text(description),
          actions: [
            ShadButton.secondary(onPressed: () => Navigator.pop(ctx, false), child: const Text('취소')),
            ShadButton(onPressed: () => Navigator.pop(ctx, true), child: Text(action)),
          ],
        ),
      ) ==
      true;

  void _openMenu() => showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.white,
    builder: (ctx) {
      Widget item(String label, VoidCallback onTap, {Color? color}) => ListTile(
        title: Text(label, style: HanaText.body.copyWith(fontWeight: .w500, color: color)),
        onTap: () {
          Navigator.pop(ctx);
          onTap();
        },
      );
      return SafeArea(
        child: Column(
          mainAxisSize: .min,
          children: [
            if (_canRequestSerious) item('진지한 인연 신청', _requestSerious),
            if (!_closed) item('대화 마치기', _close),
            item('신고하기', _report, color: HanaColors.danger),
            item('차단하기', _block, color: HanaColors.danger),
          ],
        ),
      );
    },
  );

  @override
  Widget build(BuildContext context) {
    final partner = widget.partner;
    final serious = _room?['seriousAt'] != null;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              children: [
                Padding(
                  padding: const .fromLTRB(HanaSpace.sm, HanaSpace.sm, HanaSpace.sm, HanaSpace.sm),
                  child: Row(
                    spacing: HanaSpace.sm,
                    children: [
                      ShadIconButton.ghost(
                        icon: const Icon(LucideIcons.chevronLeft, size: 22),
                        onPressed: () => Navigator.pop(context),
                      ),
                      InitialAvatar(partner['nickname'], size: 36),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: .start,
                          children: [
                            Text(partner['nickname'], style: HanaText.body, overflow: .ellipsis),
                            Text(
                              serious ? '진지한 인연' : '${langLabel[partner['nativeLang']]} 원어민',
                              style: HanaText.caption.copyWith(color: serious ? context.primary : null),
                            ),
                          ],
                        ),
                      ),
                      ShadIconButton.ghost(
                        icon: const Icon(LucideIcons.ellipsisVertical, size: 20),
                        onPressed: _openMenu,
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: HanaColors.grey100),
                ?_seriousBanner(),
                Expanded(child: _body()),
                if (_closed)
                  _ClosedBar(closedByMe: _room!['closedByMe'] == true, partnerName: partner['nickname'])
                else
                  _InputBar(
                    controller: _input,
                    sending: _sending,
                    onSend: _send,
                    letterLength: _needsLetter ? _letterLength : null,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// 진지한 인연 신청이 대기 중일 때: 받은 사람에겐 수락/거절, 보낸 사람에겐 기다리는 중
  Widget? _seriousBanner() {
    final request = _room?['seriousRequest'] as Map?;
    if (request == null || _closed) return null;
    final mine = request['requestedByMe'] == true;
    return Container(
      width: double.infinity,
      color: context.primarySoft,
      padding: const .symmetric(horizontal: HanaSpace.page, vertical: HanaSpace.md),
      child: mine
          ? Text('진지한 인연을 신청했어요. ${widget.partner['nickname']}님의 답을 기다리는 중', style: HanaText.sub)
          : Row(
              spacing: HanaSpace.sm,
              children: [
                Expanded(child: Text('${widget.partner['nickname']}님이 진지한 인연을 신청했어요', style: HanaText.sub)),
                ShadButton.outline(size: .sm, onPressed: () => _respondSerious(false), child: const Text('거절')),
                ShadButton(size: .sm, onPressed: () => _respondSerious(true), child: const Text('수락')),
              ],
            ),
    );
  }

  Widget _body() {
    if (!_loaded) return Center(child: CircularProgressIndicator(color: context.primary));
    if (_messages.isEmpty) {
      return EmptyState(
        title: '${widget.partner['nickname']}님과의 첫 대화예요',
        subtitle: '첫 메시지는 $letterMinLength자 이상의 편지로 건네보세요',
      );
    }
    // 상대가 읽은 내 메시지 중 가장 최근 것에만 '읽음'
    final partnerRead = _room?['partnerLastReadMessageId'] as int? ?? 0;
    final readMineId = _messages
        .where((m) => m['senderId'] == widget.meId && (m['id'] as int) <= partnerRead)
        .firstOrNull?['id'];
    return ListView.separated(
      controller: _scroll,
      reverse: true,
      padding: const .symmetric(horizontal: HanaSpace.page, vertical: HanaSpace.lg),
      itemCount: _messages.length,
      separatorBuilder: (_, _) => const SizedBox(height: HanaSpace.md),
      itemBuilder: (_, i) {
        final m = _messages[i];
        final mine = m['senderId'] == widget.meId;
        if (m['kind'] == 'farewell') {
          return _FarewellNote(name: mine ? '나' : widget.partner['nickname'], body: m['body']);
        }
        final time = _hhmm(DateTime.parse(m['createdAt']).toLocal());
        return Column(
          crossAxisAlignment: mine ? .end : .start,
          spacing: 2,
          children: [
            ChatBubble(m['body'], mine: mine),
            Text(m['id'] == readMineId ? '읽음 · $time' : time, style: HanaText.caption.copyWith(fontSize: 11)),
          ],
        );
      },
    );
  }
}

/// 끝맺음 인사: 말풍선 대신 가운데 정렬된 편지 모양
class _FarewellNote extends StatelessWidget {
  const _FarewellNote({required this.name, required this.body});
  final String name;
  final String body;

  @override
  Widget build(BuildContext context) => Container(
    padding: const .all(HanaSpace.lg),
    decoration: BoxDecoration(color: HanaColors.grey50, borderRadius: .circular(16)),
    child: Column(
      spacing: HanaSpace.sm,
      children: [
        Text('$name의 끝맺음 인사', style: HanaText.caption),
        Text(body, style: HanaText.sub.copyWith(color: HanaColors.grey900), textAlign: .center),
      ],
    ),
  );
}

class _ClosedBar extends StatelessWidget {
  const _ClosedBar({required this.closedByMe, required this.partnerName});
  final bool closedByMe;
  final String partnerName;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const .all(HanaSpace.lg),
    decoration: const BoxDecoration(border: Border(top: BorderSide(color: HanaColors.grey100))),
    child: Text(
      closedByMe ? '인사를 남기고 대화를 마쳤어요' : '$partnerName님이 인사를 남기고 대화를 마쳤어요',
      style: HanaText.sub,
      textAlign: .center,
    ),
  );
}

class _InputBar extends StatelessWidget {
  const _InputBar({required this.controller, required this.sending, required this.onSend, this.letterLength});
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  /// 첫 메시지(편지)를 쓰는 중이면 지금 글자 수, 아니면 null
  final int? letterLength;

  @override
  Widget build(BuildContext context) {
    final writingLetter = letterLength != null;
    final letterReady = !writingLetter || letterLength! >= letterMinLength;
    return Container(
      padding: const .fromLTRB(HanaSpace.page, HanaSpace.sm, HanaSpace.md, HanaSpace.sm),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: HanaColors.grey100)),
      ),
      child: Column(
        crossAxisAlignment: .stretch,
        spacing: HanaSpace.xs,
        children: [
          if (writingLetter)
            Row(
              children: [
                const Expanded(child: Text('첫 메시지는 정성 어린 편지로', style: HanaText.caption)),
                Text(
                  '$letterLength / $letterMinLength',
                  style: HanaText.caption.copyWith(color: letterReady ? context.primary : null),
                ),
              ],
            ),
          Row(
            spacing: HanaSpace.sm,
            children: [
              Expanded(
                child: ShadInput(
                  controller: controller,
                  placeholder: Text(writingLetter ? '나를 소개하고 대화하고 싶은 이유를 적어보세요' : '메시지를 입력하세요'),
                  maxLength: 1000,
                  minLines: writingLetter ? 3 : 1,
                  maxLines: writingLetter ? 6 : 4,
                  onSubmitted: (_) => onSend(),
                ),
              ),
              ShadIconButton(
                icon: const Icon(LucideIcons.send, size: 20),
                onPressed: sending || !letterReady ? null : onSend,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

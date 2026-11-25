import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'api.dart';
import 'theme.dart';
import 'widgets.dart';

/// 받기 전용 실시간 채널. 보내기는 REST(POST /conversations/:id/messages)로 한다.
/// 로그인 후 [connect], 로그아웃 때 [disconnect].
abstract final class ChatSocket {
  static io.Socket? _socket;
  static final _messages = StreamController<Map>.broadcast();
  static final _reconnects = StreamController<void>.broadcast();

  /// 새 메시지 (서버 `message:new`의 message)
  static Stream<Map> get messages => _messages.stream;

  /// 끊겼다 다시 붙은 순간. 그 사이 놓친 메시지는 REST로 다시 불러온다.
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
    _socket = socket.connect();
  }

  static void disconnect() {
    _socket?.dispose();
    _socket = null;
  }
}

/// 상대와의 대화방을 열거나 만든 뒤 채팅방으로 이동
Future<void> openChat(BuildContext context, {required Map partner, required int meId}) async {
  try {
    final conversation = await Api.call('POST', '/conversations', {'partnerId': partner['id']});
    if (!context.mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            ChatRoomScreen(conversationId: conversation['id'], partner: conversation['partner'], meId: meId),
      ),
    );
  } catch (e) {
    if (context.mounted) showError(context, e);
  }
}

DateTime _local(String iso) => DateTime.parse(iso).toLocal();

/// 달력상 며칠 전인지 (시각 무시, 서머타임에도 안전하게 UTC 자정끼리 비교)
int _daysAgo(DateTime t, DateTime now) =>
    DateTime.utc(now.year, now.month, now.day).difference(DateTime.utc(t.year, t.month, t.day)).inDays;

/// "오후 3:42"
String clockLabel(DateTime t) {
  final h = t.hour % 12 == 0 ? 12 : t.hour % 12;
  return '${t.hour < 12 ? '오전' : '오후'} $h:${t.minute.toString().padLeft(2, '0')}';
}

/// 채팅방 날짜 구분선: 오늘 · 어제 · 11월 23일 (일) · 2025년 11월 23일 (일)
String dayLabel(DateTime t, DateTime now) {
  final ago = _daysAgo(t, now);
  if (ago == 0) return '오늘';
  if (ago == 1) return '어제';
  final md = '${t.month}월 ${t.day}일 (${'월화수목금토일'[t.weekday - 1]})';
  return t.year == now.year ? md : '${t.year}년 $md';
}

/// 대화 목록용 시간: 오늘은 "오후 3:42", 어제는 "어제", 올해는 "11월 23일", 그 전은 "2025. 11. 23."
String chatTime(String iso, {DateTime? now}) {
  final t = _local(iso);
  now ??= DateTime.now();
  return switch (_daysAgo(t, now)) {
    0 => clockLabel(t),
    1 => '어제',
    _ when t.year == now.year => '${t.month}월 ${t.day}일',
    _ => '${t.year}. ${t.month}. ${t.day}.',
  };
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
  int? _nextCursor;
  var _loaded = false;
  var _loadingOlder = false;
  var _sending = false;
  final _input = TextEditingController();
  final _scroll = ScrollController();
  late final List<StreamSubscription> _subs;

  String get _path => '/conversations/${widget.conversationId}/messages';

  @override
  void initState() {
    super.initState();
    _loadLatest();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 200) _loadOlder();
    });
    _subs = [
      ChatSocket.messages.where((m) => m['conversationId'] == widget.conversationId).listen((m) => _merge([m])),
      ChatSocket.reconnects.listen((_) => _loadLatest()),
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

  Future<void> _loadLatest() async {
    try {
      final page = await Api.call('GET', '$_path?limit=30');
      if (!_loaded) _nextCursor = page['nextCursor'];
      _loaded = true;
      _merge((page['items'] as List).cast());
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  Future<void> _loadOlder() async {
    if (_nextCursor == null || _loadingOlder) return;
    _loadingOlder = true;
    try {
      final page = await Api.call('GET', '$_path?limit=30&before=$_nextCursor');
      _nextCursor = page['nextCursor'];
      _merge((page['items'] as List).cast());
    } catch (e) {
      if (mounted) showError(context, e);
    } finally {
      _loadingOlder = false;
    }
  }

  Future<void> _send() async {
    final body = _input.text.trim();
    if (body.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      final message = await Api.call('POST', _path, {'body': body});
      _input.clear();
      _merge([message]);
    } catch (e) {
      if (mounted) showError(context, e); // 입력한 글은 지우지 않는다
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final partner = widget.partner;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              children: [
                Padding(
                  padding: const .fromLTRB(HanaSpace.sm, HanaSpace.sm, HanaSpace.page, HanaSpace.sm),
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
                            Text('${langLabel[partner['nativeLang']]} 원어민', style: HanaText.caption),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: HanaColors.grey100),
                Expanded(child: _body()),
                _InputBar(controller: _input, sending: _sending, onSend: _send),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _body() {
    if (!_loaded) return Center(child: CircularProgressIndicator(color: context.primary));
    if (_messages.isEmpty) {
      return EmptyState(title: '${widget.partner['nickname']}님과의 첫 대화예요', subtitle: '정성 어린 첫 인사를 건네보세요');
    }
    final now = DateTime.now();
    // 최신순(0번이 맨 아래)이라 i+1이 바로 앞 메시지, i-1이 바로 뒤 메시지
    return ListView.builder(
      controller: _scroll,
      reverse: true,
      padding: const .symmetric(horizontal: HanaSpace.page, vertical: HanaSpace.lg),
      itemCount: _messages.length,
      itemBuilder: (_, i) {
        final m = _messages[i];
        final t = _local(m['createdAt']);
        final prev = i + 1 < _messages.length ? _messages[i + 1] : null;
        final next = i > 0 ? _messages[i - 1] : null;
        final newDay = prev == null || _daysAgo(_local(prev['createdAt']), t) != 0;
        int minute(Map o) => DateTime.parse(o['createdAt']).millisecondsSinceEpoch ~/ 60000;
        bool sameGroup(Map? o) => o != null && o['senderId'] == m['senderId'] && minute(o) == minute(m);
        return Column(
          children: [
            if (newDay) _DayDivider(dayLabel(t, now)),
            Padding(
              // 같은 사람이 같은 분에 이어 보낸 묶음은 촘촘하게, 말하는 사람이 바뀌면 넓게
              padding: .only(top: newDay ? 0 : (sameGroup(prev) ? HanaSpace.xs : HanaSpace.md)),
              child: ChatBubble(
                m['body'],
                mine: m['senderId'] == widget.meId,
                time: sameGroup(next) ? null : clockLabel(t), // 묶음의 마지막 말풍선에만 시간
              ),
            ),
          ],
        );
      },
    );
  }
}

/// 날짜가 바뀌는 곳에 넣는 가운데 정렬 구분선
class _DayDivider extends StatelessWidget {
  const _DayDivider(this.label);
  final String label;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const .symmetric(vertical: HanaSpace.lg),
    child: Row(
      spacing: HanaSpace.md,
      children: [
        const Expanded(child: Divider(height: 1, color: HanaColors.grey100)),
        Text(label, style: HanaText.caption),
        const Expanded(child: Divider(height: 1, color: HanaColors.grey100)),
      ],
    ),
  );
}

class _InputBar extends StatelessWidget {
  const _InputBar({required this.controller, required this.sending, required this.onSend});
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) => Container(
    padding: const .fromLTRB(HanaSpace.page, HanaSpace.sm, HanaSpace.md, HanaSpace.sm),
    decoration: const BoxDecoration(
      border: Border(top: BorderSide(color: HanaColors.grey100)),
    ),
    child: Row(
      spacing: HanaSpace.sm,
      children: [
        Expanded(
          child: ShadInput(
            controller: controller,
            placeholder: const Text('메시지를 입력하세요'),
            maxLength: 1000,
            minLines: 1,
            maxLines: 4,
            onSubmitted: (_) => onSend(),
          ),
        ),
        ShadIconButton(icon: const Icon(LucideIcons.send, size: 20), onPressed: sending ? null : onSend),
      ],
    ),
  );
}

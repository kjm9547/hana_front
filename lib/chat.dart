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

/// 목록용 시간: 오늘이면 시:분, 아니면 월/일
String chatTime(String iso) {
  final t = DateTime.parse(iso).toLocal();
  final now = DateTime.now();
  if (t.year == now.year && t.month == now.month && t.day == now.day) {
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }
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
    return ListView.separated(
      controller: _scroll,
      reverse: true,
      padding: const .symmetric(horizontal: HanaSpace.page, vertical: HanaSpace.lg),
      itemCount: _messages.length,
      separatorBuilder: (_, _) => const SizedBox(height: HanaSpace.sm),
      itemBuilder: (_, i) => ChatBubble(_messages[i]['body'], mine: _messages[i]['senderId'] == widget.meId),
    );
  }
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

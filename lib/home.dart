import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'api.dart';
import 'chat.dart';
import 'introductions.dart';
import 'main.dart' show AuthScreen;
import 'theme.dart';
import 'widgets.dart';

/// 로그인 후 화면: 바텀 네비 + 5개 탭. 순서를 바꾸려면 [_tabs]와 IndexedStack children만 맞추면 된다.
const _tabs = [
  (LucideIcons.house, '메인'),
  (LucideIcons.messageCircle, '대화방'),
  (LucideIcons.shuffle, '랜덤매칭'),
  (LucideIcons.newspaper, '게시판'),
  (LucideIcons.user, '프로필'),
];

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  var _tab = 0;
  late Future<(Map, Map)> _data = _load();

  Future<(Map, Map)> _load() async {
    final [me, phrase] = await Future.wait([Api.call('GET', '/me'), Api.call('GET', '/phrases/today')]);
    return (me as Map, phrase as Map);
  }

  @override
  void initState() {
    super.initState();
    ChatSocket.connect();
  }

  @override
  void dispose() {
    ChatSocket.disconnect(); // 로그아웃하면 이 화면이 사라지면서 끊긴다
    super.dispose();
  }

  void _go(int tab) => setState(() => _tab = tab);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: FutureBuilder(
          future: _data,
          builder: (context, snap) {
            if (snap.hasError) return Center(child: Text('${snap.error}', style: HanaText.sub));
            if (!snap.hasData) return Center(child: CircularProgressIndicator(color: context.primary));
            final (me, phrase) = snap.data!;
            return IndexedStack(
              index: _tab,
              children: [
                _MainTab(me: me, phrase: phrase),
                _ChatsTab(meId: me['id'], onFindFriends: () => _go(0)),
                _MatchTab(me: me),
                const _BoardTab(),
                _ProfileTab(me: me, onChanged: () => setState(() => _data = _load())),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: _TabBar(index: _tab, onTap: _go),
    );
  }
}

/// 흰 바탕 + 위쪽 얇은 선, 선택된 탭만 포인트 컬러
class _TabBar extends StatelessWidget {
  const _TabBar({required this.index, required this.onTap});
  final int index;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) => Container(
    decoration: const BoxDecoration(
      color: Colors.white,
      border: Border(top: BorderSide(color: HanaColors.grey200, width: 0.5)),
    ),
    child: SafeArea(
      top: false,
      child: SizedBox(
        height: 56,
        child: Row(
          children: [
            for (final (i, (icon, label)) in _tabs.indexed)
              Expanded(
                child: Semantics(
                  button: true,
                  selected: i == index,
                  label: label,
                  excludeSemantics: true,
                  child: GestureDetector(
                    behavior: .opaque,
                    onTap: () => onTap(i),
                    child: Column(
                      mainAxisAlignment: .center,
                      spacing: HanaSpace.xs,
                      children: [
                        Icon(icon, size: 22, color: i == index ? context.primary : HanaColors.grey500),
                        Text(
                          label,
                          style: HanaText.caption.copyWith(
                            fontSize: 11,
                            fontWeight: i == index ? .w600 : .w500,
                            color: i == index ? context.primary : HanaColors.grey500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}

/// 탭 공통 틀: 큰 제목 + 스크롤 본문 (+ 하단 고정 바)
class _TabPage extends StatelessWidget {
  const _TabPage({required this.title, required this.children, this.bottom});
  final String title;
  final List<Widget> children;
  final Widget? bottom;

  @override
  Widget build(BuildContext context) => Center(
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 600),
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const .fromLTRB(HanaSpace.page, HanaSpace.lg, HanaSpace.page, HanaSpace.xxl),
              children: [Text(title, style: HanaText.title), const SizedBox(height: HanaSpace.xl), ...children],
            ),
          ),
          if (bottom != null)
            Container(
              padding: const .fromLTRB(HanaSpace.page, HanaSpace.md, HanaSpace.page, HanaSpace.md),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: HanaColors.grey100))),
              child: bottom,
            ),
        ],
      ),
    ),
  );
}

const _rowDivider = Divider(height: 1, indent: 68, color: HanaColors.grey100);

// ───────────────────────── 메인 ─────────────────────────

class _MainTab extends StatelessWidget {
  const _MainTab({required this.me, required this.phrase});
  final Map me;
  final Map phrase;

  @override
  Widget build(BuildContext context) => _TabPage(
    title: 'Hana',
    children: [
      TodayPhraseCard(phrase: phrase, myLang: me['nativeLang']),
      TodayIntroductions(meId: me['id']),
    ],
  );
}

// ───────────────────────── 대화방 ─────────────────────────

class _ChatsTab extends StatefulWidget {
  const _ChatsTab({required this.meId, required this.onFindFriends});
  final int meId;
  final VoidCallback onFindFriends;

  @override
  State<_ChatsTab> createState() => _ChatsTabState();
}

class _ChatsTabState extends State<_ChatsTab> {
  List? _items;
  late final List<StreamSubscription> _subs;

  @override
  void initState() {
    super.initState();
    _load();
    // 새 메시지·읽음·방 상태 변화·재연결 때 목록을 다시 불러 순서·마지막 메시지·안 읽은 수를 맞춘다
    _subs = [
      ChatSocket.messages.listen((_) => _load()),
      ChatSocket.reads.listen((_) => _load()),
      ChatSocket.roomUpdates.listen((_) => _load()),
      ChatSocket.reconnects.listen((_) => _load()),
    ];
  }

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final res = await Api.call('GET', '/conversations');
      if (mounted) setState(() => _items = res['items']);
    } catch (e) {
      if (mounted) showError(context, e);
    }
  }

  Future<void> _open(Map c) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ChatRoomScreen(conversationId: c['id'], partner: c['partner'], meId: widget.meId),
      ),
    );
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return _TabPage(
      title: '대화방',
      children: [
        if (items == null)
          Padding(
            padding: const .only(top: 80),
            child: Center(child: CircularProgressIndicator(color: context.primary)),
          )
        else if (items.isEmpty)
          EmptyState(
            title: '아직 대화가 없어요',
            subtitle: '메인에서 친구를 골라 첫 인사를 건네보세요',
            action: ShadButton.outline(onPressed: widget.onFindFriends, child: const Text('친구 찾기')),
          )
        else
          for (final (i, c) in items.indexed) ...[
            if (i > 0) _rowDivider,
            _ConversationRow(conversation: c, meId: widget.meId, onTap: () => _open(c)),
          ],
      ],
    );
  }
}

/// 대화방 행: 아바타 + 상대 이름 + 마지막 메시지 한 줄 + 시간
class _ConversationRow extends StatelessWidget {
  const _ConversationRow({required this.conversation, required this.meId, required this.onTap});
  final Map conversation;
  final int meId;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final partner = conversation['partner'] as Map;
    final last = conversation['lastMessage'] as Map?;
    final unread = conversation['unreadCount'] as int? ?? 0;
    final preview = switch (last) {
      null => '첫 편지를 건네보세요',
      {'kind': 'farewell'} => '끝맺음 인사: ${last['body']}',
      _ => '${last['senderId'] == meId ? '나: ' : ''}${last['body']}',
    };
    // 이름 옆 작은 표시: 마친 대화 / 진지한 인연
    final (tag, tagColor) = conversation['closedAt'] != null
        ? ('마친 대화', HanaColors.grey500)
        : conversation['seriousAt'] != null
        ? ('진지한 인연', context.primary)
        : (null, null);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const .symmetric(vertical: HanaSpace.md),
        child: Row(
          spacing: HanaSpace.lg,
          children: [
            InitialAvatar(partner['nickname']),
            Expanded(
              child: Column(
                crossAxisAlignment: .start,
                spacing: 2,
                children: [
                  Row(
                    spacing: HanaSpace.sm,
                    children: [
                      Flexible(child: Text(partner['nickname'], style: HanaText.body, overflow: .ellipsis)),
                      if (tag != null) Text(tag, style: HanaText.caption.copyWith(fontSize: 11, color: tagColor)),
                    ],
                  ),
                  Text(
                    preview,
                    style: HanaText.sub.copyWith(color: last == null ? HanaColors.grey500 : null),
                    maxLines: 1,
                    overflow: .ellipsis,
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: .end,
              spacing: HanaSpace.xs,
              children: [
                if (last != null) Text(chatTime(last['createdAt']), style: HanaText.caption),
                if (unread > 0)
                  Container(
                    padding: const .symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(color: context.primary, borderRadius: .circular(10)),
                    child: Text(
                      unread > 99 ? '99+' : '$unread',
                      style: HanaText.caption.copyWith(color: Colors.white, fontSize: 11, fontWeight: .w700),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ───────────────────────── 랜덤매칭 ─────────────────────────

class _MatchTab extends StatelessWidget {
  const _MatchTab({required this.me});
  final Map me;

  @override
  Widget build(BuildContext context) {
    final other = me['nativeLang'] == 'ko' ? '일본어' : '한국어';
    return _TabPage(
      title: '랜덤매칭',
      bottom: ShadButton(
        width: double.infinity,
        height: 52,
        // ponytail: 매칭·통화 기능 전까지는 안내만. 다음 단계에서 시그널링 서버와 연결.
        onPressed: () => showInfo(context, '랜덤 통화는 곧 열려요'),
        child: const Text('랜덤 통화 시작', style: TextStyle(fontSize: 16, fontWeight: .w600)),
      ),
      children: [
        Text('지금 접속한 $other 원어민과\n바로 통화해요', style: HanaText.section),
        const SizedBox(height: HanaSpace.sm),
        const Text('처음엔 3분, 마음이 맞으면 더 길게', style: HanaText.sub),
        const SectionHeader('이렇게 진행돼요'),
        for (final (i, text) in [
          '접속 중인 $other 원어민을 찾아요',
          '연결되면 오늘의 표현으로 인사해요',
          '마음이 맞으면 친구 신청을 보내요',
        ].indexed)
          Padding(
            padding: const .symmetric(vertical: HanaSpace.sm),
            child: Row(
              crossAxisAlignment: .start,
              spacing: HanaSpace.md,
              children: [
                SizedBox(width: 20, child: Text('${i + 1}', style: HanaText.body.copyWith(color: context.primary))),
                Expanded(child: Text(text, style: HanaText.body.copyWith(fontWeight: .w500))),
              ],
            ),
          ),
      ],
    );
  }
}

// ───────────────────────── 게시판 ─────────────────────────

class _BoardTab extends StatelessWidget {
  const _BoardTab();

  @override
  Widget build(BuildContext context) => const _TabPage(
    title: '게시판',
    children: [EmptyState(title: '게시판은 준비 중이에요', subtitle: '여행 후기, 질문, 동행 모집을 나눌 공간이에요')],
  );
}

// ───────────────────────── 프로필 ─────────────────────────

class _ProfileTab extends StatelessWidget {
  const _ProfileTab({required this.me, required this.onChanged});
  final Map me;
  final VoidCallback onChanged;

  Future<void> _editBio(BuildContext context) async {
    final ctrl = TextEditingController(text: me['bio']);
    final bio = await showShadDialog<String>(
      context: context,
      builder: (ctx) => ShadDialog(
        title: const Text('자기소개'),
        description: const Text('어떤 언어를, 왜 배우고 있는지 적어보세요'),
        actions: [
          ShadButton.secondary(onPressed: () => Navigator.pop(ctx), child: const Text('취소')),
          ShadButton(onPressed: () => Navigator.pop(ctx, ctrl.text), child: const Text('저장')),
        ],
        child: Padding(padding: const .symmetric(vertical: HanaSpace.sm), child: ShadTextarea(controller: ctrl)),
      ),
    );
    if (bio == null) return;
    try {
      await Api.call('PATCH', '/me', {'bio': bio});
      onChanged();
    } catch (e) {
      if (context.mounted) showError(context, e);
    }
  }

  Future<void> _setPreference(BuildContext context, String value) async {
    if (value == me['matchPreference']) return;
    try {
      await Api.call('PATCH', '/me', {'matchPreference': value});
      onChanged();
      if (context.mounted) showInfo(context, '내일 소개부터 반영돼요');
    } catch (e) {
      if (context.mounted) showError(context, e);
    }
  }

  void _logout(BuildContext context) {
    Api.token = null;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const AuthScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final bio = me['bio'] as String;
    return _TabPage(
      title: '프로필',
      children: [
        Row(
          spacing: HanaSpace.lg,
          children: [
            InitialAvatar(me['nickname'], size: 72),
            Expanded(
              child: Column(
                crossAxisAlignment: .start,
                spacing: 2,
                children: [
                  Text(me['nickname'], style: HanaText.section),
                  Text('${langLabel[me['nativeLang']]} 원어민 · ${me['email']}', style: HanaText.caption),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: HanaSpace.lg),
        Text(
          bio.isEmpty ? '아직 자기소개가 없어요' : bio,
          style: HanaText.sub.copyWith(color: bio.isEmpty ? HanaColors.grey500 : null),
        ),
        const SectionHeader('소개 받을 사람'),
        Row(
          spacing: HanaSpace.sm,
          children: [
            for (final (value, title, subtitle) in [
              ('any', '누구나', '국적 상관없이'),
              ('cross', '한·일만', '${me['nativeLang'] == 'ko' ? '일본어' : '한국어'} 원어민만'),
            ])
              Expanded(
                child: ChoiceCard(
                  title: title,
                  subtitle: subtitle,
                  selected: me['matchPreference'] == value,
                  onTap: () => _setPreference(context, value),
                ),
              ),
          ],
        ),
        const SectionHeader('계정'),
        _MenuRow(label: '자기소개 수정', onTap: () => _editBio(context)),
        const Divider(height: 1, color: HanaColors.grey100),
        _MenuRow(
          label: '차단한 사람',
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BlockedUsersScreen())),
        ),
        const Divider(height: 1, color: HanaColors.grey100),
        _MenuRow(label: '로그아웃', color: HanaColors.danger, onTap: () => _logout(context)),
      ],
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({required this.label, required this.onTap, this.color});
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const .symmetric(vertical: HanaSpace.lg),
      child: Row(
        children: [
          Expanded(child: Text(label, style: HanaText.body.copyWith(fontWeight: .w500, color: color))),
          if (color == null) const Icon(LucideIcons.chevronRight, size: 20, color: HanaColors.grey500),
        ],
      ),
    ),
  );
}

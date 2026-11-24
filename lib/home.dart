import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'api.dart';
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
  // ponytail: 상대 목록은 첫 페이지(50명)만. 사용자가 늘면 nextCursor로 무한 스크롤.
  late Future<(Map, List, Map)> _data = _load();

  Future<(Map, List, Map)> _load() async {
    final [me, page, phrase] = await Future.wait([
      Api.call('GET', '/me'),
      Api.call('GET', '/users?limit=50'),
      Api.call('GET', '/phrases/today'),
    ]);
    return (me as Map, page['items'] as List, phrase as Map);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HanaColors.grey100, // iOS 그룹 목록처럼: 회색 바탕 + 흰 카드
      body: SafeArea(
        bottom: false,
        child: FutureBuilder(
          future: _data,
          builder: (context, snap) {
            if (snap.hasError) return Center(child: Text('${snap.error}', style: HanaText.sub));
            if (!snap.hasData) return Center(child: CircularProgressIndicator(color: context.primary));
            final (me, partners, phrase) = snap.data!;
            return IndexedStack(
              index: _tab,
              children: [
                _MainTab(me: me, partners: partners, phrase: phrase),
                const _ChatsTab(),
                _MatchTab(me: me),
                const _BoardTab(),
                _ProfileTab(me: me, onChanged: () => setState(() => _data = _load())),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: _TabBar(index: _tab, onTap: (i) => setState(() => _tab = i)),
    );
  }
}

/// iOS 탭바: 흰 바탕 + 위쪽 얇은 선, 선택된 탭만 포인트 컬러
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
        height: 60,
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
                      spacing: 4,
                      children: [
                        Icon(icon, size: 24, color: i == index ? context.primary : HanaColors.grey500),
                        Text(
                          label,
                          style: HanaText.caption.copyWith(
                            fontSize: 11,
                            fontWeight: i == index ? .w700 : .w500,
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

/// 탭 공통 틀: 왼쪽 큰 제목 + 스크롤 본문
class _TabPage extends StatelessWidget {
  const _TabPage({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Center(
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 600),
      child: ListView(
        padding: const .fromLTRB(20, 24, 20, 32),
        children: [Text(title, style: HanaText.title), const SizedBox(height: 16), ...children],
      ),
    ),
  );
}

/// 아직 없는 기능의 빈 화면
class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => GroupCard(
    child: Padding(
      padding: const .symmetric(horizontal: 24, vertical: 48),
      child: Column(
        spacing: 8,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(color: context.primarySoft, shape: .circle),
            child: Icon(icon, color: context.primary, size: 28),
          ),
          const SizedBox(height: 8),
          Text(title, style: HanaText.heading),
          Text(subtitle, style: HanaText.sub, textAlign: .center),
        ],
      ),
    ),
  );
}

// ───────────────────────── 메인 ─────────────────────────

class _MainTab extends StatelessWidget {
  const _MainTab({required this.me, required this.partners, required this.phrase});
  final Map me;
  final List partners;
  final Map phrase;

  @override
  Widget build(BuildContext context) => _TabPage(
    title: '${me['nickname']}님, 안녕하세요',
    children: [
      HeroBanner(
        title: '오늘은 누구와\n이야기해볼까요?',
        subtitle: '今日は誰と話そう？',
        icon: LucideIcons.messagesSquare,
        pill: '친구 ${partners.length}명이 기다려요',
      ),
      const SizedBox(height: 12),
      TodayPhraseCard(phrase: phrase, myLang: me['nativeLang']),
      SectionLabel('나와 언어를 바꿔줄 친구 ${partners.length}명'),
      GroupCard(
        child: partners.isEmpty
            ? const Padding(padding: .all(24), child: Text('아직 상대가 없어요', style: HanaText.sub))
            : Column(
                children: [
                  for (final (i, p) in partners.indexed) ...[
                    if (i > 0) const Divider(height: 1, indent: 80, color: HanaColors.grey100),
                    PersonRow(
                      person: p,
                      trailing: const Icon(LucideIcons.chevronRight, size: 20, color: HanaColors.grey500),
                    ),
                  ],
                ],
              ),
      ),
    ],
  );
}

// ───────────────────────── 대화방 ─────────────────────────

class _ChatsTab extends StatelessWidget {
  const _ChatsTab();

  @override
  Widget build(BuildContext context) => const _TabPage(
    title: '대화방',
    children: [
      _EmptyState(
        icon: LucideIcons.messageCircle,
        title: '아직 대화가 없어요',
        subtitle: '메인에서 친구를 골라\n첫 인사를 건네보세요',
      ),
    ],
  );
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
      children: [
        HeroBanner(
          title: '지금 접속한 친구와\n바로 통화해요',
          subtitle: '$other 원어민과 3분, 가볍게 시작해요',
          icon: LucideIcons.phoneCall,
        ),
        const SizedBox(height: 12),
        // ponytail: 매칭·통화 기능 전까지는 안내만. 다음 단계에서 시그널링 서버와 연결.
        ShadButton(
          height: 56,
          onPressed: () => showInfo(context, '랜덤 통화는 곧 열려요!'),
          leading: const Icon(LucideIcons.shuffle, size: 20),
          child: const Text('랜덤 통화 시작', style: TextStyle(fontSize: 17, fontWeight: .w600)),
        ),
        const SectionLabel('이렇게 진행돼요'),
        GroupCard(
          child: Column(
            children: [
              for (final (i, (icon, color, text)) in [
                (LucideIcons.radar, context.primary, '접속 중인 $other 원어민을 찾아요'),
                (LucideIcons.phone, const Color(0xFF34C759), '연결되면 오늘의 표현으로 인사해요'),
                (LucideIcons.heartHandshake, const Color(0xFFFF9500), '마음이 맞으면 친구 신청을 보내요'),
              ].indexed) ...[
                if (i > 0) const Divider(height: 1, indent: 64, color: HanaColors.grey100),
                Padding(
                  padding: const .symmetric(horizontal: 16, vertical: 14),
                  child: Row(
                    spacing: 16,
                    children: [
                      IconTile(icon, color),
                      Expanded(child: Text(text, style: HanaText.body.copyWith(fontSize: 16))),
                    ],
                  ),
                ),
              ],
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
    children: [
      _EmptyState(
        icon: LucideIcons.newspaper,
        title: '게시판 준비 중',
        subtitle: '여행 후기, 질문, 동행 모집을\n나눌 공간이에요',
      ),
    ],
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
        child: Padding(padding: const .symmetric(vertical: 8), child: ShadTextarea(controller: ctrl)),
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
        GroupCard(
          child: Padding(
            padding: const .symmetric(vertical: 28, horizontal: 20),
            child: Column(
              spacing: 6,
              children: [
                InitialAvatar(me['nickname'], size: 80),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: .center,
                  spacing: 8,
                  children: [Text(me['nickname'], style: HanaText.heading), LangBadge(me['nativeLang'])],
                ),
                Text(me['email'], style: HanaText.caption),
                const SizedBox(height: 8),
                Text(
                  bio.isEmpty ? '자기소개를 써보세요' : bio,
                  style: HanaText.sub.copyWith(color: bio.isEmpty ? HanaColors.grey500 : null),
                  textAlign: .center,
                ),
              ],
            ),
          ),
        ),
        const SectionLabel('설정'),
        GroupCard(
          child: Column(
            children: [
              _SettingRow(icon: LucideIcons.pencil, color: context.primary, label: '자기소개 수정', onTap: () => _editBio(context)),
              const Divider(height: 1, indent: 64, color: HanaColors.grey100),
              _SettingRow(icon: LucideIcons.logOut, color: HanaColors.grey500, label: '로그아웃', onTap: () => _logout(context)),
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({required this.icon, required this.color, required this.label, required this.onTap});
  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const .symmetric(horizontal: 16, vertical: 12),
      child: Row(
        spacing: 16,
        children: [
          IconTile(icon, color),
          Expanded(child: Text(label, style: HanaText.body)),
          const Icon(LucideIcons.chevronRight, size: 20, color: HanaColors.grey500),
        ],
      ),
    ),
  );
}

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
            final (me, partners, phrase) = snap.data!;
            return IndexedStack(
              index: _tab,
              children: [
                _MainTab(me: me, partners: partners, phrase: phrase),
                _ChatsTab(onFindFriends: () => _go(0)),
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
  const _MainTab({required this.me, required this.partners, required this.phrase});
  final Map me;
  final List partners;
  final Map phrase;

  @override
  Widget build(BuildContext context) => _TabPage(
    title: 'Hana',
    children: [
      TodayPhraseCard(phrase: phrase, myLang: me['nativeLang']),
      SectionHeader('언어교환 친구', trailing: '${partners.length}명'),
      if (partners.isEmpty)
        const EmptyState(title: '아직 친구가 없어요', subtitle: '새 친구가 가입하면 여기에 보여요')
      else
        for (final (i, p) in partners.indexed) ...[if (i > 0) _rowDivider, PersonRow(person: p)],
    ],
  );
}

// ───────────────────────── 대화방 ─────────────────────────

class _ChatsTab extends StatelessWidget {
  const _ChatsTab({required this.onFindFriends});
  final VoidCallback onFindFriends;

  @override
  Widget build(BuildContext context) => _TabPage(
    title: '대화방',
    children: [
      EmptyState(
        title: '아직 대화가 없어요',
        subtitle: '메인에서 친구를 골라 첫 인사를 건네보세요',
        action: ShadButton.outline(onPressed: onFindFriends, child: const Text('친구 찾기')),
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
        const SectionHeader('계정'),
        _MenuRow(label: '자기소개 수정', onTap: () => _editBio(context)),
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

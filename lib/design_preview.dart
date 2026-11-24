import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

import 'theme.dart';
import 'widgets.dart';

// ponytail: 컬러 확정용 디버그 화면. palette_switcher.dart와 함께 지울 것.
/// 팔레트별로 컴포넌트가 어떻게 보이는지 한 화면에서 비교하는 디자인 미리보기
class DesignPreviewScreen extends StatefulWidget {
  const DesignPreviewScreen({super.key});
  @override
  State<DesignPreviewScreen> createState() => _DesignPreviewScreenState();
}

class _DesignPreviewScreenState extends State<DesignPreviewScreen> {
  var _switch = true;
  var _check = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HanaColors.grey100,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: ListView(
              padding: const .fromLTRB(20, 16, 20, 120),
              children: [
                Row(
                  children: [
                    ShadIconButton.ghost(
                      icon: const Icon(LucideIcons.chevronLeft, size: 22),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Text('디자인 미리보기', style: HanaText.title.copyWith(fontSize: 22)),
                  ],
                ),
                const SizedBox(height: 12),
                const HeroBanner(
                  title: '서울에서 만나요',
                  subtitle: '언어교환 친구가 여행 메이트가 되는 순간',
                  icon: LucideIcons.planeTakeoff,
                  pill: '동행 신청하기',
                ),

                const SectionLabel('버튼'),
                GroupCard(
                  child: Padding(
                    padding: const .all(16),
                    child: Column(
                      crossAxisAlignment: .stretch,
                      spacing: 10,
                      children: [
                        ShadButton(height: 52, onPressed: () {}, child: const Text('통화 시작하기')),
                        Row(
                          spacing: 8,
                          children: [
                            Expanded(child: ShadButton.secondary(onPressed: () {}, child: const Text('보조'))),
                            Expanded(child: ShadButton.outline(onPressed: () {}, child: const Text('외곽선'))),
                            Expanded(child: ShadButton.ghost(onPressed: () {}, child: const Text('고스트'))),
                          ],
                        ),
                        Row(
                          spacing: 8,
                          children: [
                            Expanded(
                              child: ShadButton.secondary(
                                backgroundColor: context.primarySoft,
                                foregroundColor: context.primary,
                                hoverBackgroundColor: context.primarySoft,
                                onPressed: () {},
                                child: const Text('옅은 포인트'),
                              ),
                            ),
                            Expanded(child: ShadButton.destructive(onPressed: () {}, child: const Text('신고하기'))),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SectionLabel('배지 · 아바타'),
                GroupCard(
                  child: Padding(
                    padding: const .all(16),
                    child: Column(
                      crossAxisAlignment: .start,
                      spacing: 14,
                      children: [
                        const Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ShadBadge(child: Text('NEW')),
                            ShadBadge.secondary(child: Text('여행 가능')),
                            ShadBadge.outline(child: Text('초보')),
                            LangBadge('ko'),
                            LangBadge('ja'),
                          ],
                        ),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            for (final n in ['ゆき', '민수', 'はると', '지우', 'さくら', '하늘']) InitialAvatar(n, size: 44),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SectionLabel('입력 · 컨트롤'),
                GroupCard(
                  child: Padding(
                    padding: const .all(16),
                    child: Column(
                      crossAxisAlignment: .stretch,
                      spacing: 14,
                      children: [
                        const ShadInput(placeholder: Text('메시지를 입력하세요')),
                        Row(
                          children: [
                            const Expanded(child: Text('통화 알림 받기', style: HanaText.body)),
                            ShadSwitch(value: _switch, onChanged: (v) => setState(() => _switch = v)),
                          ],
                        ),
                        Row(
                          children: [
                            const Expanded(child: Text('여행 동행 가능', style: HanaText.body)),
                            ShadCheckbox(value: _check, onChanged: (v) => setState(() => _check = v)),
                          ],
                        ),
                        const ShadSlider(initialValue: 60, min: 0, max: 100),
                        const ShadProgress(value: 0.6),
                      ],
                    ),
                  ),
                ),

                const SectionLabel('설정 목록 (iOS 아이콘 타일)'),
                GroupCard(
                  child: Column(
                    children: [
                      for (final (i, (icon, color, label)) in [
                        (LucideIcons.bell, context.primary, '알림'),
                        (LucideIcons.languages, const Color(0xFF007AFF), '학습 언어'),
                        (LucideIcons.mapPin, const Color(0xFFFF9500), '여행 일정'),
                        (LucideIcons.shieldCheck, const Color(0xFF34C759), '안전 센터'),
                        (LucideIcons.ban, HanaColors.grey500, '차단 목록'),
                      ].indexed) ...[
                        if (i > 0) const Divider(height: 1, indent: 64, color: HanaColors.grey100),
                        Padding(
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
                      ],
                    ],
                  ),
                ),

                const SectionLabel('통화 화면 (목업) · 오늘의 표현'),
                Container(
                  padding: const .fromLTRB(20, 32, 20, 24),
                  decoration: BoxDecoration(
                    borderRadius: .circular(28),
                    gradient: LinearGradient(
                      begin: .topCenter,
                      end: .bottomCenter,
                      colors: [shiftColor(context.primary, light: -0.25), HanaColors.grey900],
                    ),
                  ),
                  child: Column(
                    children: [
                      const InitialAvatar('ゆき', size: 88),
                      const SizedBox(height: 12),
                      Text('ゆき', style: HanaText.heading.copyWith(color: Colors.white)),
                      Text('03:12', style: HanaText.sub.copyWith(color: Colors.white.withValues(alpha: 0.7))),
                      const SizedBox(height: 24),
                      const TodayPhraseCard(phrase: _samplePhrase, myLang: 'ko', onDark: true),
                      const SizedBox(height: 28),
                      Row(
                        mainAxisAlignment: .spaceEvenly,
                        children: [
                          _CallButton(LucideIcons.micOff, Colors.white.withValues(alpha: 0.15)),
                          const _CallButton(LucideIcons.phoneOff, HanaColors.danger, size: 68),
                          _CallButton(LucideIcons.volume2, Colors.white.withValues(alpha: 0.15)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const TodayPhraseCard(phrase: _samplePhrase, myLang: 'ja'),

                const SectionLabel('채팅 말풍선'),
                GroupCard(
                  child: Padding(
                    padding: const .all(16),
                    child: Column(
                      spacing: 8,
                      children: [
                        const _Bubble('안녕하세요! 韓国語を勉強しています', mine: false),
                        const _Bubble('반가워요! 저는 일본어 배우는 중이에요', mine: true),
                        const _Bubble('来月ソウルに行きます。おすすめありますか？', mine: false),
                        const _Bubble('그럼 제가 성수동 안내해드릴게요!', mine: true),
                        const SizedBox(height: 4),
                        Row(
                          spacing: 8,
                          children: [
                            const Expanded(child: ShadInput(placeholder: Text('메시지 보내기'))),
                            ShadIconButton(icon: const Icon(LucideIcons.send, size: 18), onPressed: () {}),
                            ShadIconButton.secondary(icon: const Icon(LucideIcons.phone, size: 18), onPressed: () {}),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

const _samplePhrase = {
  'ko': '추천해 주실 곳 있어요?',
  'ja': 'おすすめの場所はありますか？',
  'koReading': 'チュチョネ ジュシル コッ イッソヨ？',
  'jaReading': '오스스메노 바쇼와 아리마스카?',
  'situation': {'ko': '여행을 계획할 때', 'ja': '旅行の計画を立てる時'},
};

class _CallButton extends StatelessWidget {
  const _CallButton(this.icon, this.color, {this.size = 56});
  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(color: color, shape: .circle),
    child: Icon(icon, color: Colors.white, size: size * 0.4),
  );
}

class _Bubble extends StatelessWidget {
  const _Bubble(this.text, {required this.mine});
  final String text;
  final bool mine;

  @override
  Widget build(BuildContext context) => Align(
    alignment: mine ? .centerRight : .centerLeft,
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280),
      child: Container(
        padding: const .symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: mine ? context.primary : HanaColors.grey100,
          borderRadius: .only(
            topLeft: const .circular(18),
            topRight: const .circular(18),
            bottomLeft: .circular(mine ? 18 : 4),
            bottomRight: .circular(mine ? 4 : 18),
          ),
        ),
        child: Text(text, style: HanaText.sub.copyWith(color: mine ? Colors.white : HanaColors.grey900)),
      ),
    ),
  );
}

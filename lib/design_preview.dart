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
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: ListView(
              padding: const .fromLTRB(HanaSpace.page, HanaSpace.lg, HanaSpace.page, 120),
              children: [
                Row(
                  children: [
                    ShadIconButton.ghost(
                      icon: const Icon(LucideIcons.chevronLeft, size: 22),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Text('디자인 미리보기', style: HanaText.section),
                  ],
                ),

                const SectionHeader('오늘의 표현 (시그니처)'),
                const TodayPhraseCard(phrase: _samplePhrase, myLang: 'ko'),
                const SizedBox(height: HanaSpace.md),
                const TodayPhraseCard(phrase: _samplePhrase, myLang: 'ja'),

                const SectionHeader('버튼'),
                ShadButton(width: double.infinity, height: 52, onPressed: () {}, child: const Text('통화 시작하기')),
                const SizedBox(height: HanaSpace.sm),
                Row(
                  spacing: HanaSpace.sm,
                  children: [
                    Expanded(child: ShadButton.secondary(onPressed: () {}, child: const Text('보조'))),
                    Expanded(child: ShadButton.outline(onPressed: () {}, child: const Text('외곽선'))),
                    Expanded(child: ShadButton.ghost(onPressed: () {}, child: const Text('고스트'))),
                  ],
                ),

                const SectionHeader('입력 · 컨트롤'),
                const ShadInput(placeholder: Text('메시지를 입력하세요')),
                const SizedBox(height: HanaSpace.sm),
                Row(
                  children: [
                    Expanded(child: Text('통화 알림 받기', style: HanaText.body.copyWith(fontWeight: .w500))),
                    ShadSwitch(value: _switch, onChanged: (v) => setState(() => _switch = v)),
                  ],
                ),
                const SizedBox(height: HanaSpace.md),
                Row(
                  children: [
                    Expanded(child: Text('여행 동행 가능', style: HanaText.body.copyWith(fontWeight: .w500))),
                    ShadCheckbox(value: _check, onChanged: (v) => setState(() => _check = v)),
                  ],
                ),

                const SectionHeader('목록', trailing: '3명'),
                for (final (i, p) in _samplePeople.indexed) ...[
                  if (i > 0) const Divider(height: 1, indent: 68, color: HanaColors.grey100),
                  PersonRow(person: p),
                ],

                const SectionHeader('통화 화면 (목업)'),
                Container(
                  padding: const .fromLTRB(HanaSpace.xl, HanaSpace.xxl, HanaSpace.xl, HanaSpace.xl),
                  decoration: BoxDecoration(color: HanaColors.grey900, borderRadius: .circular(28)),
                  child: Column(
                    children: [
                      const InitialAvatar('ゆき', size: 88),
                      const SizedBox(height: HanaSpace.md),
                      Text('ゆき', style: HanaText.section.copyWith(color: Colors.white)),
                      Text('03:12', style: HanaText.caption.copyWith(color: Colors.white.withValues(alpha: 0.7))),
                      const SizedBox(height: HanaSpace.xl),
                      const TodayPhraseCard(phrase: _samplePhrase, myLang: 'ko', onDark: true),
                      const SizedBox(height: HanaSpace.xxl),
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

                const SectionHeader('채팅 말풍선'),
                const ChatBubble('안녕하세요! 韓国語を勉強しています', mine: false),
                const SizedBox(height: HanaSpace.sm),
                const ChatBubble('반가워요! 저는 일본어 배우는 중이에요', mine: true),
                const SizedBox(height: HanaSpace.sm),
                const ChatBubble('来月ソウルに行きます。おすすめありますか？', mine: false),
                const SizedBox(height: HanaSpace.sm),
                const ChatBubble('그럼 제가 성수동 안내해드릴게요!', mine: true),

                const SectionHeader('빈 화면'),
                EmptyState(
                  title: '아직 대화가 없어요',
                  subtitle: '메인에서 친구를 골라 첫 인사를 건네보세요',
                  action: ShadButton.outline(onPressed: () {}, child: const Text('친구 찾기')),
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

const _samplePeople = [
  {'nickname': 'ゆき', 'nativeLang': 'ja', 'bio': '東京在住。韓国ドラマが好きで韓国語を勉強中です！'},
  {'nickname': 'はると', 'nativeLang': 'ja', 'bio': '大阪出身のエンジニア。釜山の美味しいお店を教えてください'},
  {'nickname': '민수', 'nativeLang': 'ko', 'bio': ''},
];

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

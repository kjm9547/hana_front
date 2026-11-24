import 'package:material_ui/material_ui.dart';

import 'theme.dart';

const langLabel = {'ko': '한국어', 'ja': '日本語'};

/// 사진이 생기기 전까지 쓰는 이니셜 아바타. 장식 없이 중립 회색.
class InitialAvatar extends StatelessWidget {
  const InitialAvatar(this.name, {super.key, this.size = 52});
  final String name;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    alignment: .center,
    decoration: const BoxDecoration(color: HanaColors.grey100, shape: .circle),
    child: Text(
      name.characters.first,
      style: HanaText.body.copyWith(color: HanaColors.grey700, fontWeight: .w700, fontSize: size * 0.38),
    ),
  );
}

/// 선택 카드: 선택되면 포인트 테두리 + 옅은 포인트 면
class ChoiceCard extends StatelessWidget {
  const ChoiceCard({super.key, required this.title, required this.subtitle, required this.selected, required this.onTap});
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    child: GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const .all(HanaSpace.lg),
        decoration: BoxDecoration(
          color: selected ? context.primarySoft : Colors.white,
          borderRadius: .circular(12),
          border: .all(color: selected ? context.primary : HanaColors.grey200, width: selected ? 1.5 : 1),
        ),
        child: Column(
          crossAxisAlignment: .start,
          spacing: 2,
          children: [
            Text(title, style: HanaText.body),
            Text(subtitle, style: HanaText.caption),
          ],
        ),
      ),
    ),
  );
}

/// 섹션 제목 (+ 오른쪽 보조 정보)
class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.trailing});
  final String title;
  final String? trailing;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const .only(top: HanaSpace.xxl, bottom: HanaSpace.sm),
    child: Row(
      crossAxisAlignment: .end,
      children: [
        Expanded(child: Text(title, style: HanaText.section)),
        if (trailing != null) Text(trailing!, style: HanaText.caption),
      ],
    ),
  );
}

/// 목록 행: 아바타 + 이름 + 모국어 + 자기소개 한 줄. 카드 없이 흰 바탕 위에.
class PersonRow extends StatelessWidget {
  const PersonRow({super.key, required this.person, this.onTap});
  final Map person;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final bio = person['bio'] as String;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const .symmetric(vertical: HanaSpace.md),
        child: Row(
          spacing: HanaSpace.lg,
          children: [
            InitialAvatar(person['nickname']),
            Expanded(
              child: Column(
                crossAxisAlignment: .start,
                spacing: 2,
                children: [
                  Text(person['nickname'], style: HanaText.body, overflow: .ellipsis),
                  Text('${langLabel[person['nativeLang']]} 원어민', style: HanaText.caption),
                  if (bio.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(bio, style: HanaText.sub, maxLines: 1, overflow: .ellipsis),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 오늘의 일본어 / 今日の韓国語 — Hana의 시그니처 블록. 화면에서 유일하게 색 면을 갖는다.
/// 내가 배우는 언어(모국어의 반대)를 크게, 발음과 뜻을 작게.
/// [onDark]: 통화 화면처럼 어두운 배경 위에 올릴 때
class TodayPhraseCard extends StatelessWidget {
  const TodayPhraseCard({super.key, required this.phrase, required this.myLang, this.onDark = false});
  final Map phrase;
  final String myLang;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final learnJa = myLang == 'ko';
    final fg = onDark ? Colors.white : HanaColors.grey900;
    final dim = onDark ? Colors.white.withValues(alpha: 0.7) : HanaColors.grey700;
    final accent = onDark ? Colors.white : context.primary;
    return Container(
      padding: const .all(HanaSpace.xl),
      decoration: BoxDecoration(
        color: onDark ? Colors.white.withValues(alpha: 0.1) : context.primarySoft,
        borderRadius: .circular(20),
      ),
      child: Column(
        crossAxisAlignment: .start,
        children: [
          Text.rich(
            TextSpan(
              children: [
                TextSpan(text: learnJa ? '오늘의 일본어' : '今日の韓国語', style: TextStyle(color: accent, fontWeight: .w700)),
                TextSpan(text: '  ·  ${phrase['situation'][myLang]}'),
              ],
            ),
            style: HanaText.caption.copyWith(color: dim),
          ),
          const SizedBox(height: HanaSpace.md),
          Text(phrase[learnJa ? 'ja' : 'ko'], style: HanaText.display.copyWith(color: fg)),
          const SizedBox(height: HanaSpace.xs),
          Text(phrase[learnJa ? 'jaReading' : 'koReading'], style: HanaText.sub.copyWith(color: accent, fontWeight: .w600)),
          const SizedBox(height: HanaSpace.sm),
          Text(phrase[myLang], style: HanaText.sub.copyWith(color: dim)),
        ],
      ),
    );
  }
}

/// 빈 화면: 제목 + 설명 + (선택) 버튼 하나
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.title, required this.subtitle, this.action});
  final String title;
  final String subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const .symmetric(vertical: 80),
    child: Column(
      spacing: HanaSpace.sm,
      children: [
        Text(title, style: HanaText.section, textAlign: .center),
        Text(subtitle, style: HanaText.sub, textAlign: .center),
        if (action != null) ...[const SizedBox(height: HanaSpace.lg), action!],
      ],
    ),
  );
}

/// 채팅 말풍선: 내 메시지는 오른쪽 포인트 컬러, 상대는 왼쪽 회색
class ChatBubble extends StatelessWidget {
  const ChatBubble(this.text, {super.key, required this.mine});
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

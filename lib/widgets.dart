import 'package:material_ui/material_ui.dart';

import 'theme.dart';

const langLabel = {'ko': '한국어', 'ja': '日本語'};

class LangBadge extends StatelessWidget {
  const LangBadge(this.lang, {super.key});
  final String lang;

  @override
  Widget build(BuildContext context) => Container(
    padding: const .symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: lang == 'ja' ? context.primarySoft : HanaColors.grey100,
      borderRadius: .circular(6),
    ),
    child: Text(
      langLabel[lang]!,
      style: HanaText.caption.copyWith(color: lang == 'ja' ? context.primary : HanaColors.grey700),
    ),
  );
}

class InitialAvatar extends StatelessWidget {
  const InitialAvatar(this.name, {super.key, this.size = 48});
  final String name;
  final double size;

  @override
  Widget build(BuildContext context) {
    final c = pastelFor(name);
    return Container(
      width: size,
      height: size,
      alignment: .center,
      decoration: BoxDecoration(color: c.bg, shape: .circle),
      child: Text(
        name.characters.first,
        style: HanaText.body.copyWith(color: c.fg, fontWeight: .w700, fontSize: size * 0.4),
      ),
    );
  }
}

/// 토스식 선택 카드: 선택되면 포인트 테두리 + 옅은 포인트 면
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
        padding: const .all(16),
        decoration: BoxDecoration(
          color: selected ? context.primarySoft : HanaColors.grey50,
          borderRadius: .circular(14),
          border: .all(color: selected ? context.primary : HanaColors.grey200, width: selected ? 1.5 : 1),
        ),
        child: Column(
          crossAxisAlignment: .start,
          spacing: 2,
          children: [
            Text(title, style: HanaText.body.copyWith(fontWeight: .w600)),
            Text(subtitle, style: HanaText.caption),
          ],
        ),
      ),
    ),
  );
}

/// 포인트 컬러 그라데이션 카드. 끝색은 팔레트에서 자동 도출.
class HeroBanner extends StatelessWidget {
  const HeroBanner({super.key, required this.title, required this.subtitle, required this.icon, this.pill});
  final String title;
  final String subtitle;
  final IconData icon;
  final String? pill;

  @override
  Widget build(BuildContext context) {
    final p = context.primary;
    return Container(
      padding: const .all(22),
      decoration: BoxDecoration(
        borderRadius: .circular(22),
        gradient: LinearGradient(
          begin: .topLeft,
          end: .bottomRight,
          colors: [p, shiftColor(p, hue: 28, light: 0.1)],
        ),
      ),
      child: Row(
        crossAxisAlignment: .start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: .start,
              spacing: 6,
              children: [
                Text(title, style: HanaText.heading.copyWith(color: Colors.white, height: 1.35)),
                Text(subtitle, style: HanaText.sub.copyWith(color: Colors.white.withValues(alpha: 0.85))),
                if (pill != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const .symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: .circular(99)),
                    child: Text(pill!, style: HanaText.caption.copyWith(color: p, fontWeight: .w700)),
                  ),
                ],
              ],
            ),
          ),
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: .circle),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
        ],
      ),
    );
  }
}

/// iOS 그룹 목록의 흰 카드
class GroupCard extends StatelessWidget {
  const GroupCard({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    clipBehavior: .antiAlias,
    decoration: BoxDecoration(color: Colors.white, borderRadius: .circular(20)),
    child: child,
  );
}

/// iOS 설정 앱식 컬러 아이콘 타일
class IconTile extends StatelessWidget {
  const IconTile(this.icon, this.color, {super.key});
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    width: 32,
    height: 32,
    decoration: BoxDecoration(color: color, borderRadius: .circular(9)),
    child: Icon(icon, color: Colors.white, size: 18),
  );
}

/// 오늘의 일본어 / 今日の韓国語. 내가 배우는 언어(모국어의 반대)를 크게, 발음과 뜻을 작게.
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
    final dim = onDark ? Colors.white.withValues(alpha: 0.7) : HanaColors.grey500;
    final accent = onDark ? Colors.white : context.primary;
    return Container(
      padding: const .all(20),
      decoration: BoxDecoration(
        color: onDark ? Colors.white.withValues(alpha: 0.1) : Colors.white,
        borderRadius: .circular(20),
      ),
      child: Column(
        crossAxisAlignment: .start,
        children: [
          Row(
            children: [
              Container(
                padding: const .symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: onDark ? Colors.white.withValues(alpha: 0.15) : context.primarySoft,
                  borderRadius: .circular(99),
                ),
                child: Text(learnJa ? '오늘의 일본어' : '今日の韓国語', style: HanaText.caption.copyWith(color: accent, fontWeight: .w700)),
              ),
              const Spacer(),
              Text(phrase['situation'][myLang], style: HanaText.caption.copyWith(color: dim)),
            ],
          ),
          const SizedBox(height: 14),
          Text(phrase[learnJa ? 'ja' : 'ko'], style: HanaText.heading.copyWith(fontSize: 22, color: fg)),
          const SizedBox(height: 4),
          Text(phrase[learnJa ? 'jaReading' : 'koReading'], style: HanaText.sub.copyWith(color: accent, fontWeight: .w500)),
          const SizedBox(height: 10),
          Text(phrase[myLang], style: HanaText.sub.copyWith(color: dim)),
        ],
      ),
    );
  }
}

/// 아바타 + 닉네임 + 언어 배지 + 자기소개 한 줄 (목록 행)
class PersonRow extends StatelessWidget {
  const PersonRow({super.key, required this.person, required this.trailing, this.emptyBio = ''});
  final Map person;
  final Widget trailing;
  final String emptyBio;

  @override
  Widget build(BuildContext context) {
    final bio = person['bio'] as String;
    return Padding(
      padding: const .fromLTRB(16, 14, 8, 14),
      child: Row(
        spacing: 16,
        children: [
          InitialAvatar(person['nickname']),
          Expanded(
            child: Column(
              crossAxisAlignment: .start,
              spacing: 4,
              children: [
                Row(
                  spacing: 8,
                  children: [
                    Flexible(child: Text(person['nickname'], style: HanaText.body.copyWith(fontWeight: .w600), overflow: .ellipsis)),
                    LangBadge(person['nativeLang']),
                  ],
                ),
                if (bio.isNotEmpty || emptyBio.isNotEmpty)
                  Text(
                    bio.isEmpty ? emptyBio : bio,
                    style: HanaText.sub.copyWith(color: bio.isEmpty ? HanaColors.grey500 : null),
                    maxLines: 2,
                    overflow: .ellipsis,
                  ),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}

class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) =>
      Padding(padding: const .fromLTRB(4, 28, 0, 10), child: Text(text, style: HanaText.caption));
}

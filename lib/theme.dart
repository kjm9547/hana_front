import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

/// Hana 디자인 토큰. 토스/iOS 톤: 흰 바탕 + 옅은 회색 면, 테두리 최소화, 큰 굵은 타이틀, 둥근 모서리.
/// 포인트 컬러는 테마에서 읽는다: context.primary / context.primarySoft
abstract final class HanaColors {
  // 회색 단계 (토스 grey 계열 톤)
  static const grey50 = Color(0xFFF9FAFB);
  static const grey100 = Color(0xFFF2F4F6);
  static const grey200 = Color(0xFFE5E8EB);
  static const grey500 = Color(0xFF8B95A1);
  static const grey700 = Color(0xFF4E5968);
  static const grey900 = Color(0xFF191F28);

  static const danger = Color(0xFFF04452);
}

/// 포인트 컬러 후보. primary = 버튼/강조, soft = 옅은 배경(배지, 선택 카드)
typedef HanaPalette = ({String name, Color primary, Color soft});

const palettes = <HanaPalette>[
  (name: '벚꽃 라즈베리', primary: Color(0xFFD6336A), soft: Color(0xFFFDECF1)),
  (name: '사쿠라 소프트', primary: Color(0xFFF06A8E), soft: Color(0xFFFFF0F4)),
  (name: '코랄', primary: Color(0xFFF2643C), soft: Color(0xFFFFF1EC)),
  (name: '토스 블루', primary: Color(0xFF3182F6), soft: Color(0xFFE8F3FF)),
  (name: '아이 (藍)', primary: Color(0xFF3D4DB7), soft: Color(0xFFEDEFFB)),
  (name: '후지 (藤)', primary: Color(0xFF8B5CF6), soft: Color(0xFFF3EEFF)),
  (name: '말차', primary: Color(0xFF2E9E6B), soft: Color(0xFFE8F7EF)),
  (name: '먹 (墨)', primary: Color(0xFF191F28), soft: Color(0xFFF2F4F6)),
];

/// 색상환에서 hue를 돌리고 밝기를 더한 색 (그라데이션 끝색 등을 팔레트에서 자동 도출)
Color shiftColor(Color c, {double hue = 0, double light = 0}) {
  final hsl = HSLColor.fromColor(c);
  return hsl.withHue((hsl.hue + hue) % 360).withLightness((hsl.lightness + light).clamp(0, 1)).toColor();
}

/// 이름마다 고정된 파스텔 색 (아바타용). 팔레트와 무관하게 화면에 생기를 준다.
({Color bg, Color fg}) pastelFor(String seed) {
  final hue = seed.codeUnits.fold(7, (a, b) => (a * 31 + b) % 360).toDouble();
  return (
    bg: HSLColor.fromAHSL(1, hue, 0.75, 0.92).toColor(),
    fg: HSLColor.fromAHSL(1, hue, 0.50, 0.40).toColor(),
  );
}

/// 흰 글자 대비. 4.5 이상이면 WCAG AA (본문 크기 기준)
double contrastOnWhite(Color c) => 1.05 / (c.computeLuminance() + 0.05);

const _font = 'Pretendard';

ShadThemeData hanaTheme(HanaPalette p) => ShadThemeData(
  brightness: Brightness.light,
  radius: BorderRadius.circular(14),
  textTheme: ShadTextTheme(family: _font),
  colorScheme: ShadColorScheme(
    background: Colors.white,
    foreground: HanaColors.grey900,
    card: Colors.white,
    cardForeground: HanaColors.grey900,
    popover: Colors.white,
    popoverForeground: HanaColors.grey900,
    primary: p.primary,
    primaryForeground: Colors.white,
    secondary: HanaColors.grey100,
    secondaryForeground: HanaColors.grey900,
    muted: HanaColors.grey100,
    mutedForeground: HanaColors.grey500,
    accent: p.soft,
    accentForeground: p.primary,
    destructive: HanaColors.danger,
    destructiveForeground: Colors.white,
    border: HanaColors.grey200,
    input: HanaColors.grey200,
    ring: p.primary,
    selection: p.soft,
  ),
);

extension HanaThemeX on BuildContext {
  Color get primary => ShadTheme.of(this).colorScheme.primary;
  Color get primarySoft => ShadTheme.of(this).colorScheme.accent;
}

/// Material 위젯(Scaffold, ListTile 등)도 같은 글꼴·색을 쓰도록 맞춘다.
ThemeData hanaMaterialTheme(BuildContext context, ThemeData base) => base.copyWith(
  textTheme: base.textTheme.apply(fontFamily: _font, bodyColor: HanaColors.grey900, displayColor: HanaColors.grey900),
  scaffoldBackgroundColor: Colors.white,
  splashFactory: NoSplash.splashFactory, // iOS처럼 물결 효과 없음
);

/// 토스식 타이포 스케일 (iOS 본문 17pt 기준)
abstract final class HanaText {
  static const title = TextStyle(fontFamily: _font, fontSize: 26, fontWeight: FontWeight.w700, height: 1.35, color: HanaColors.grey900);
  static const heading = TextStyle(fontFamily: _font, fontSize: 20, fontWeight: FontWeight.w700, color: HanaColors.grey900);
  static const body = TextStyle(fontFamily: _font, fontSize: 17, fontWeight: FontWeight.w500, color: HanaColors.grey900);
  static const sub = TextStyle(fontFamily: _font, fontSize: 15, fontWeight: FontWeight.w400, color: HanaColors.grey700, height: 1.45);
  static const caption = TextStyle(fontFamily: _font, fontSize: 13, fontWeight: FontWeight.w500, color: HanaColors.grey500);
}

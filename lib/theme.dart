import 'package:material_ui/material_ui.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

/// Hana 디자인 규칙
/// - 흰 바탕에 콘텐츠를 바로 올린다. 섹션은 카드가 아니라 여백 + 섹션 제목으로 나눈다.
/// - 포인트 컬러는 주요 버튼, 선택된 탭, 오늘의 표현(시그니처) 세 곳에만.
/// - 간격은 [HanaSpace], 글자는 [HanaText] 밖의 값을 쓰지 않는다.
abstract final class HanaColors {
  static const grey50 = Color(0xFFF9FAFB);
  static const grey100 = Color(0xFFF2F4F6);
  static const grey200 = Color(0xFFE5E8EB);
  static const grey500 = Color(0xFF8B95A1);
  static const grey700 = Color(0xFF4E5968);
  static const grey900 = Color(0xFF191F28);

  /// 포인트 컬러 = 펭귄 목도리 레드. 주요 버튼, 선택된 탭, 내 말풍선, 선택 상태
  static const primary = Color(0xFFD93A31); // 흰 글자 4.6
  static const primarySoft = Color(0xFFFFF0EE);

  /// 오늘의 표현(시그니처) 전용 남색
  static const accent = Color(0xFF2340B0); // 흰 글자 8.6
  static const accentSoft = Color(0xFFEBEFFC);

  /// 로그아웃 한 곳뿐이라 primary와 같은 색
  static const danger = primary;
}

/// 4/8 단위 간격 스케일
abstract final class HanaSpace {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
  static const page = 20.0; // 화면 좌우 여백
}

const _font = 'Pretendard';

final hanaTheme = ShadThemeData(
  brightness: Brightness.light,
  radius: BorderRadius.circular(12),
  textTheme: ShadTextTheme(family: _font),
  colorScheme: ShadColorScheme(
    background: Colors.white,
    foreground: HanaColors.grey900,
    card: Colors.white,
    cardForeground: HanaColors.grey900,
    popover: Colors.white,
    popoverForeground: HanaColors.grey900,
    primary: HanaColors.primary,
    primaryForeground: Colors.white,
    secondary: HanaColors.grey100,
    secondaryForeground: HanaColors.grey900,
    muted: HanaColors.grey100,
    mutedForeground: HanaColors.grey500,
    accent: HanaColors.primarySoft,
    accentForeground: HanaColors.primary,
    destructive: HanaColors.danger,
    destructiveForeground: Colors.white,
    border: HanaColors.grey200,
    input: HanaColors.grey200,
    ring: HanaColors.primary,
    selection: HanaColors.primarySoft,
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

/// 글자 5단계 + 대표 문구 1단계
abstract final class HanaText {
  /// 탭 제목 (iOS large title 계열)
  static const title = TextStyle(fontFamily: _font, fontSize: 28, fontWeight: FontWeight.w700, height: 1.3, color: HanaColors.grey900);

  /// 섹션 제목
  static const section = TextStyle(fontFamily: _font, fontSize: 20, fontWeight: FontWeight.w700, height: 1.3, color: HanaColors.grey900);

  /// 목록의 이름, 본문 강조
  static const body = TextStyle(fontFamily: _font, fontSize: 16, fontWeight: FontWeight.w600, color: HanaColors.grey900);

  /// 설명, 자기소개
  static const sub = TextStyle(fontFamily: _font, fontSize: 14, fontWeight: FontWeight.w400, height: 1.45, color: HanaColors.grey700);

  /// 메타 정보 (언어, 시간, 개수)
  static const caption = TextStyle(fontFamily: _font, fontSize: 13, fontWeight: FontWeight.w500, color: HanaColors.grey500);

  /// 오늘의 표현처럼 화면에서 가장 크게 보여줄 문장
  static const display = TextStyle(fontFamily: _font, fontSize: 24, fontWeight: FontWeight.w700, height: 1.35, color: HanaColors.grey900);
}

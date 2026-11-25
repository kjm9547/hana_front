import { StyleSheet } from 'react-native';

/**
 * Hana 디자인 규칙
 * - 흰 바탕에 콘텐츠를 바로 올린다. 섹션은 카드가 아니라 여백 + 섹션 제목으로 나눈다.
 * - 포인트 컬러는 주요 버튼, 선택된 탭, 내 말풍선, 선택 상태에만. 오늘의 표현만 남색.
 * - 간격은 space, 글자는 text 밖의 값을 쓰지 않는다.
 */
export const colors = {
  white: '#FFFFFF',
  grey50: '#F9FAFB',
  grey100: '#F2F4F6',
  grey200: '#E5E8EB',
  grey500: '#8B95A1',
  grey700: '#4E5968',
  grey900: '#191F28',

  /** 포인트 컬러 = 펭귄 목도리 레드 (흰 글자 대비 4.6) */
  primary: '#D93A31',
  primarySoft: '#FFF0EE',

  /** 오늘의 표현(시그니처) 전용 남색 (흰 글자 대비 8.6) */
  accent: '#2340B0',
  accentSoft: '#EBEFFC',

  /** 로그아웃 한 곳뿐이라 primary와 같은 색 */
  danger: '#D93A31',
} as const;

/** 4/8 단위 간격 */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, page: 20 } as const;

export const radius = 12;

/** 화면 최대 폭 (웹·태블릿에서 가운데 정렬) */
export const maxWidth = 600;

// 굵기마다 글꼴 파일이 따로라 fontWeight 대신 fontFamily로 굵기를 고른다 (Android가 fontWeight를 무시함)
export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const fontFiles = {
  [font.regular]: require('../../assets/fonts/PretendardJP-Regular.otf'),
  [font.medium]: require('../../assets/fonts/PretendardJP-Medium.otf'),
  [font.semibold]: require('../../assets/fonts/PretendardJP-SemiBold.otf'),
  [font.bold]: require('../../assets/fonts/PretendardJP-Bold.otf'),
};

/** 글자 5단계 + 대표 문구 1단계 */
export const text = StyleSheet.create({
  /** 탭 제목 (iOS large title 계열) */
  title: { fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: colors.grey900 },
  /** 섹션 제목 */
  section: { fontFamily: font.bold, fontSize: 20, lineHeight: 26, color: colors.grey900 },
  /** 목록의 이름, 본문 강조 */
  body: { fontFamily: font.semibold, fontSize: 16, lineHeight: 22, color: colors.grey900 },
  /** 설명, 자기소개 */
  sub: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.grey700 },
  /** 메타 정보 (언어, 시간, 개수) */
  caption: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.grey500 },
  /** 오늘의 표현처럼 화면에서 가장 크게 보여줄 문장 */
  display: { fontFamily: font.bold, fontSize: 24, lineHeight: 32, color: colors.grey900 },
});

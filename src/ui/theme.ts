import { useCSSVariable } from 'uniwind';

// 색·글자·간격 토큰의 원본은 src/global.css. 여기는 JS에서만 필요한 것만 둔다.

/** 굵기별 글꼴 파일. 이름은 global.css의 --font-* 와 같아야 한다. */
export const fontFiles = {
  'Pretendard-Regular': require('../../assets/fonts/PretendardJP-Regular.otf'),
  'Pretendard-Medium': require('../../assets/fonts/PretendardJP-Medium.otf'),
  'Pretendard-SemiBold': require('../../assets/fonts/PretendardJP-SemiBold.otf'),
  'Pretendard-Bold': require('../../assets/fonts/PretendardJP-Bold.otf'),
};

/** className을 못 받는 곳(탭바 색, 로딩 표시 등)에 global.css의 색을 넘길 때 */
export const useColor = (name: 'primary' | 'grey-200' | 'grey-500' | 'white') =>
  useCSSVariable(`--color-${name}`) as string;

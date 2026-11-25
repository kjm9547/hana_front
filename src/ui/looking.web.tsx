import { Image } from 'expo-image';

// ponytail: 웹의 Lottie 플레이어(dotlottie)는 WASM을 외부 CDN에서 받아와서 자체 서버 원칙에 어긋난다.
// 웹 미리보기에서는 정지 이미지로 대신한다. 앱(iOS/Android)은 looking.tsx의 애니메이션이 돈다.
export function LookingPenguin(size: { width: number; height: number }) {
  return <Image source={require('../../assets/mascot/idle.svg')} style={size} contentFit="contain" accessible={false} />;
}

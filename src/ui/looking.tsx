import LottieView from 'lottie-react-native';
import { useReducedMotion } from 'react-native-reanimated';

/** 두리번거리는 펭귄 (Lottie 루프). 동작 줄이기 설정이면 멈춘다. */
export function LookingPenguin(size: { width: number; height: number }) {
  const reduce = useReducedMotion();
  return <LottieView source={require('../../assets/mascot/looking.json')} autoPlay={!reduce} loop style={size} />;
}

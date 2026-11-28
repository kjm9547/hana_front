import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/js-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/lib/session';
import { ToastHost } from '@/lib/toast';
import { fontFiles, useColor } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontFiles);
  const ready = loaded || !!error;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Routes />
      <ToastHost />
    </SessionProvider>
  );
}

/**
 * 로그인 전에는 login·signup만, 로그인 후에는 나머지 화면만 열린다. 상태가 바뀌면 라우터가 알아서 옮겨 준다.
 * 화면은 오른쪽에서 밀려 들어오고(왼쪽 끝을 밀면 뒤로), 매칭 대기·자기소개 수정만 아래에서 올라온다.
 */
function Routes() {
  const { me } = useSession();
  const white = useColor('white');
  return (
    // ponytail: JS 스택 — native-stack은 웹에서 애니메이션이 없어서 웹·iOS·Android를 한 가지로 맞췄다.
    // iOS 전환이 버벅이면 네이티브에서만 expo-router의 Stack으로 바꾼다.
    <Stack screenOptions={{ headerShown: false, cardStyle: { backgroundColor: white }, animation: 'slide_from_right' }}>
      <Stack.Protected guard={!me}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!me}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="post/write" />
        <Stack.Screen name="match-waiting" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="edit-bio" options={{ animation: 'slide_from_bottom' }} />
      </Stack.Protected>
    </Stack>
  );
}

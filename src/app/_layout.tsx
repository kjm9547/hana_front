import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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

/** 로그인 전에는 login·signup만, 로그인 후에는 나머지 화면만 열린다. 상태가 바뀌면 라우터가 알아서 옮겨 준다. */
function Routes() {
  const { me } = useSession();
  const white = useColor('white');
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: white } }}>
      <Stack.Protected guard={!me}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!me}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="post/write" options={{ presentation: 'modal' }} />
        <Stack.Screen name="match-waiting" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="edit-bio" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

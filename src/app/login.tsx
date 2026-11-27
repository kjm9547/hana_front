import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
import { showError, showInfo } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { FieldScreen, Mascot } from '@/ui/hana';
import { Input } from '@/ui/input';
import { Text } from '@/ui/text';

// 개발 빌드 전용이라 번역하지 않는다
const TEST_ACCOUNTS = [
  ['minsu@hana.dev', '민수 · 한국어'],
  ['yuki@hana.dev', 'ゆき · 日本語'],
] as const;

/** 소셜 버튼: [글자, 버튼 색, 글자 색]. Apple 로그인은 App Store 심사 기준 4.8 때문에 iOS에만, 맨 위에. */
const SOCIAL: [label: string, button: string, text: string][] = [
  ...(Platform.OS === 'ios' ? [[t.auth.apple, 'bg-apple active:bg-apple/80', 'text-white'] as [string, string, string]] : []),
  [t.auth.google, 'border border-google-border bg-white active:bg-grey-100', 'text-grey-900'],
  [t.auth.line, 'bg-line active:bg-line/90', 'text-white'],
  [t.auth.kakao, 'bg-kakao active:bg-kakao/90', 'text-black/85'],
];
// iOS는 버튼이 5개라 조금 낮춘다 (46 / 48)
const SOCIAL_H = Platform.OS === 'ios' ? 'h-[46px]' : 'h-12';

type Mode = 'social' | 'email';

/** AUTH-00 랜딩: 소셜 버튼 ↔ 이메일 로그인. 가입은 /signup(AUTH-02 퍼널) */
export default function LoginScreen() {
  const { signIn } = useSession();
  const [mode, setMode] = useState<Mode>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (creds = { email, password }) => {
    setBusy(true);
    try {
      const res = await api<{ accessToken: string }>('POST', '/auth/token', creds);
      await signIn(res.accessToken); // 로그인되면 라우터가 메인으로 옮긴다
    } catch (e) {
      showError(e);
      setBusy(false);
    }
  };

  return (
    <Landing
      mode={mode}
      busy={busy}
      onMode={setMode}
      email={email}
      password={password}
      onEmail={setEmail}
      onPassword={setPassword}
      onLogin={() => submit()}
      onTestLogin={(e) => {
        setEmail(e);
        setPassword('password123');
        submit({ email: e, password: 'password123' });
      }}
    />
  );
}

/** AUTH-00 랜딩: 색 면 + 큰 'Hana' + 화면 가득 펭귄, 아래에 로그인 방법 */
function Landing(props: {
  mode: Mode;
  busy: boolean;
  onMode: (m: Mode) => void;
  email: string;
  password: string;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onLogin: () => void;
  onTestLogin: (email: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <FieldScreen edges={[]}>
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute" style={{ left: -97, top: 160 }}>
          <Mascot pose="idle" width={585} />
        </View>
        <Text className="absolute left-7 font-bold text-wordmark tracking-[-3px] text-white" style={{ top: insets.top + 20 }}>
          Hana
        </Text>
      </View>

      <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="gap-2 px-page">
          {props.mode === 'social' ? (
            <>
              {SOCIAL.map(([label, button, text]) => (
                // ponytail: 서버에 소셜 로그인(OAuth)이 붙기 전까지 안내만. 로고는 브랜드 가이드 파일을 받으면 왼쪽에.
                <Button key={label} className={cn(SOCIAL_H, button)} onPress={() => showInfo(t.auth.socialSoon)}>
                  <Text className={cn('font-semibold', text)}>{label}</Text>
                </Button>
              ))}
              <Button className={cn(SOCIAL_H, 'bg-ink active:bg-ink/90')} onPress={() => props.onMode('email')}>
                <Text className="font-semibold">{t.auth.hana}</Text>
              </Button>
            </>
          ) : (
            <>
              <Input
                className="h-12 bg-white"
                value={props.email}
                onChangeText={props.onEmail}
                placeholder={t.auth.email}
                aria-label={t.auth.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                className="h-12 bg-white"
                value={props.password}
                onChangeText={props.onPassword}
                placeholder={t.auth.password}
                aria-label={t.auth.password}
                secureTextEntry
              />
              <Button className="h-12 bg-ink active:bg-ink/90" onPress={props.onLogin} disabled={props.busy}>
                <Text className="font-semibold">{t.auth.login}</Text>
              </Button>
              <Text
                role="link"
                variant="caption"
                className="self-center py-2.5 font-bold text-ink"
                onPress={() => props.onMode('social')}>
                {t.auth.otherWays}
              </Text>
              {/* ponytail: 개발용 빠른 로그인 (개발 빌드에만). 서버에서 npm run seed 로 만든 계정이 있어야 동작. */}
              {__DEV__ && (
                <View className="flex-row items-center justify-center gap-1.5">
                  <Text variant="caption" className="text-white">
                    {t.auth.testLogin}
                  </Text>
                  {TEST_ACCOUNTS.map(([e, label]) => (
                    <Button
                      key={e}
                      variant="onField"
                      className="h-9 px-3"
                      disabled={props.busy}
                      onPress={() => props.onTestLogin(e)}>
                      <Text className="text-caption">{label}</Text>
                    </Button>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View className="items-center gap-2 pt-6" style={{ paddingBottom: insets.bottom + 20 }}>
          <Text variant="caption" className="text-ink">
            {t.auth.noAccount}{' '}
            <Text role="link" className="font-bold text-caption text-ink underline" onPress={() => router.push('/signup')}>
              {t.auth.signUp}
            </Text>
          </Text>
          {/* ponytail: 약관 페이지가 생기면 링크로 */}
          <Text variant="caption" className="font-normal text-ink">
            {t.auth.termsBefore}
            <Text className="font-bold text-caption text-ink">{t.auth.terms}</Text>
            {t.auth.termsAfter}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </FieldScreen>
  );
}

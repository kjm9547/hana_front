import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { api, type Lang } from '@/lib/api';
import { useSession } from '@/lib/session';
import { showError } from '@/lib/toast';
import { Button } from '@/ui/button';
import { ChoiceCard, langLabel, Mascot, Screen } from '@/ui/hana';
import { Input } from '@/ui/input';
import { Text } from '@/ui/text';

const TEST_ACCOUNTS = [
  ['minsu@hana.dev', '민수 · 한국어'],
  ['yuki@hana.dev', 'ゆき · 日本語'],
] as const;

/** AUTH-01 로그인 / AUTH-02 가입 */
export default function LoginScreen() {
  const { signIn } = useSession();
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const [busy, setBusy] = useState(false);

  const submit = async (creds = { email, password }, register = signUp) => {
    setBusy(true);
    try {
      const body = register ? { ...creds, nickname, nativeLang: lang } : creds;
      const res = await api<{ accessToken: string }>('POST', register ? '/auth/register' : '/auth/token', body);
      await signIn(res.accessToken); // 로그인되면 라우터가 메인으로 옮긴다
    } catch (e) {
      showError(e);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-8 pb-6" keyboardShouldPersistTaps="handled">
          <Mascot pose={signUp ? 'hello' : 'idle'} width={80} />
          <Text variant="title" className="mt-5">
            {signUp ? '반가워요!\n어떤 분인지 알려주세요' : 'Hana에서\n새로운 인연을 만나요'}
          </Text>
          <Text variant="sub" className="mt-2 mb-9">
            {signUp ? 'はじめまして！' : '一度の出会いが、ひとつの縁に'}
          </Text>

          <View className="gap-3">
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input value={password} onChangeText={setPassword} placeholder="비밀번호 (8자 이상)" secureTextEntry />
            {signUp && <Input value={nickname} onChangeText={setNickname} placeholder="닉네임" />}
          </View>

          {signUp && (
            <>
              <Text variant="caption" className="mt-7 mb-2.5">
                모국어를 골라주세요
              </Text>
              <View className="flex-row gap-2.5" role="radiogroup">
                {(['ko', 'ja'] as const).map((l) => (
                  <ChoiceCard
                    key={l}
                    title={langLabel[l]}
                    subtitle={l === 'ko' ? '한국어로 말해요' : '日本語で話します'}
                    selected={lang === l}
                    onPress={() => setLang(l)}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* 토스식 하단 고정 CTA */}
        <View className="px-6 pb-4">
          <Button size="lg" onPress={() => submit()} disabled={busy}>
            <Text>{signUp ? '가입하기' : '로그인'}</Text>
          </Button>
          <Button variant="ghost" onPress={() => setSignUp(!signUp)}>
            <Text>{signUp ? '이미 계정이 있어요' : '처음이에요 · 가입하기'}</Text>
          </Button>
          {/* ponytail: 개발용 빠른 로그인 (개발 빌드에만). 서버에서 npm run seed 로 만든 계정이 있어야 동작. */}
          {__DEV__ && (
            <View className="flex-row items-center justify-center gap-1.5">
              <Text variant="caption">테스트 로그인</Text>
              {TEST_ACCOUNTS.map(([e, label]) => (
                <Button
                  key={e}
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onPress={() => {
                    setSignUp(false);
                    setEmail(e);
                    setPassword('password123');
                    submit({ email: e, password: 'password123' }, false);
                  }}>
                  <Text>{label}</Text>
                </Button>
              ))}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

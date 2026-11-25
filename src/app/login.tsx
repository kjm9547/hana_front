import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api, type Lang } from '@/lib/api';
import { useSession } from '@/lib/session';
import { showError } from '@/lib/toast';
import { Button, ChoiceCard, Input, langLabel, Mascot, Screen } from '@/ui/components';
import { space, text } from '@/ui/theme';

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Mascot pose={signUp ? 'hello' : 'idle'} width={80} />
          <Text style={[text.title, { marginTop: 20 }]}>
            {signUp ? '반가워요!\n어떤 분인지 알려주세요' : 'Hana에서\n새로운 인연을 만나요'}
          </Text>
          <Text style={[text.sub, { marginTop: space.sm, marginBottom: 36 }]}>
            {signUp ? 'はじめまして！' : '一度の出会いが、ひとつの縁に'}
          </Text>

          <View style={{ gap: space.md }}>
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
              <Text style={[text.caption, { marginTop: 28, marginBottom: 10 }]}>모국어를 골라주세요</Text>
              <View style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="radiogroup">
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
        <View style={styles.footer}>
          <Button title={signUp ? '가입하기' : '로그인'} onPress={() => submit()} disabled={busy} />
          <Button
            variant="ghost"
            size="md"
            title={signUp ? '이미 계정이 있어요' : '처음이에요 · 가입하기'}
            onPress={() => setSignUp(!signUp)}
          />
          {/* ponytail: 개발용 빠른 로그인 (개발 빌드에만). 서버에서 npm run seed 로 만든 계정이 있어야 동작. */}
          {__DEV__ && (
            <View style={styles.quick}>
              <Text style={text.caption}>테스트 로그인</Text>
              {[
                ['minsu@hana.dev', '민수 · 한국어'],
                ['yuki@hana.dev', 'ゆき · 日本語'],
              ].map(([e, label]) => (
                <Button
                  key={e}
                  variant="outline"
                  size="sm"
                  title={label}
                  disabled={busy}
                  onPress={() => {
                    setSignUp(false);
                    setEmail(e);
                    setPassword('password123');
                    submit({ email: e, password: 'password123' }, false);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xl },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.lg },
  quick: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

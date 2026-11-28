import { router, useFocusEffect } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, View } from 'react-native';

import { api, type Lang } from '@/lib/api';
import { useSession } from '@/lib/session';
import { showError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Choice, FieldScreen, langLabel, Mascot, Screen } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Input } from '@/ui/input';
import { Text } from '@/ui/text';

type Gender = 'male' | 'female';
type Form = { email: string; password: string; nickname: string; lang: Lang | null; gender: Gender | null; y: string; m: string; d: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NICKNAME_MAX = 12;

/** 생년월일: 년 4자리 · 실제 있는 날짜 · 올해까지 */
function validBirth({ y, m, d }: Form) {
  const [Y, M, D] = [Number(y), Number(m), Number(d)];
  if (!/^\d{4}$/.test(y) || Y < 1900 || Y > new Date().getFullYear() || M < 1 || M > 12) return false;
  return D >= 1 && D <= new Date(Y, M, 0).getDate();
}

/** 단계마다 [질문, 다음으로 넘어갈 수 있는지] */
const STEPS: [title: string, ok: (f: Form) => boolean][] = [
  ['이메일을\n알려주세요', (f) => EMAIL.test(f.email)],
  ['비밀번호를\n정해주세요', (f) => f.password.length >= 8],
  ['뭐라고\n불러드릴까요?', (f) => f.nickname.trim().length >= 1],
  ['모국어를\n골라주세요', (f) => f.lang !== null],
  ['성별을\n골라주세요', (f) => f.gender !== null],
  ['생년월일을\n알려주세요', validBirth],
];

/**
 * AUTH-02 회원가입 퍼널: 한 화면에 질문 하나, 1 이메일 → 2 비밀번호 → 3 닉네임 → 4 모국어 → 5 성별 → 6 생년월일 → 완료.
 * 진행 막대·단계 숫자 없이 왼쪽 위 뒤로만. 조건을 채우기 전엔 '다음'이 잠긴다. 마지막 단계에서 한 번에 가입.
 */
// ponytail: 소셜 가입(1·2단계 건너뛰고 닉네임부터)은 서버에 소셜 로그인이 붙을 때.
export default function SignUpScreen() {
  const { signIn } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({ email: '', password: '', nickname: '', lang: null, gender: null, y: '', m: '', d: '' });
  const [busy, setBusy] = useState(false);
  /** 가입이 끝나면 받은 토큰. 완료 화면의 '시작하기'에서 로그인한다 (바로 로그인하면 완료 화면 없이 메인으로 넘어가서) */
  const [token, setToken] = useState<string | null>(null);
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const back = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else router.back();
    return true;
  }, [step]);

  // Android 시스템 뒤로도 이전 단계로
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', back);
      return () => sub.remove();
    }, [back]),
  );

  const next = async () => {
    if (step < STEPS.length - 1) return setStep(step + 1);
    setBusy(true);
    try {
      // ponytail: 서버가 아직 gender·birthdate를 저장하지 않는다 (hana_server signUpSchema에 추가 필요)
      const res = await api<{ accessToken: string }>('POST', '/auth/register', {
        email: form.email,
        password: form.password,
        nickname: form.nickname.trim(),
        nativeLang: form.lang,
        gender: form.gender,
        birthdate: `${form.y}-${form.m.padStart(2, '0')}-${form.d.padStart(2, '0')}`,
      });
      setToken(res.accessToken);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  if (token) {
    return (
      <FieldScreen>
        <View className="flex-1 px-page pt-16">
          <Text variant="display" className="text-white">
            반가워요!
          </Text>
          <View className="mt-auto mb-3 items-center">
            <Mascot pose="hello" width={280} />
          </View>
        </View>
        <View className="px-page pt-3 pb-5">
          <Button variant="onField" size="lg" onPress={() => signIn(token)}>
            <Text>시작하기</Text>
          </Button>
        </View>
      </FieldScreen>
    );
  }

  const [title, ok] = STEPS[step];
  return (
    <Screen>
      <View className="h-14 justify-center px-2">
        <Button variant="ghost" size="icon" aria-label="이전" onPress={back}>
          <Icon as={ChevronLeft} className="size-6 text-foreground" />
        </Button>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-page pt-3">
          <Text variant="display">{title}</Text>
          <View className="mt-8">
            <StepInput step={step} form={form} set={set} onSubmit={() => ok(form) && next()} />
          </View>
        </View>
        <View className="px-page pt-3 pb-5">
          <Button size="lg" disabled={!ok(form) || busy} onPress={next}>
            <Text>다음</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** 단계별 입력 */
function StepInput({ step, form, set, onSubmit }: { step: number; form: Form; set: (p: Partial<Form>) => void; onSubmit: () => void }) {
  switch (step) {
    case 0:
      return (
        <Input
          key="email"
          value={form.email}
          onChangeText={(email) => set({ email })}
          placeholder="hana@example.com"
          aria-label="이메일"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          onSubmitEditing={onSubmit}
          submitBehavior="submit"
        />
      );
    case 1: {
      const long = form.password.length >= 8;
      return (
        <>
          <Input
            key="password"
            value={form.password}
            onChangeText={(password) => set({ password })}
            placeholder="비밀번호"
            aria-label="비밀번호"
            secureTextEntry
            autoComplete="new-password"
            autoFocus
            onSubmitEditing={onSubmit}
            submitBehavior="submit"
          />
          <View className="mt-3 flex-row items-center gap-1">
            <Icon as={Check} className={cn('size-4', long ? 'text-primary-strong' : 'text-grey-500')} />
            <Text variant="caption" className={cn(long && 'text-primary-strong')}>
              8자 이상
            </Text>
          </View>
        </>
      );
    }
    case 2:
      return (
        <>
          <Input
            key="nickname"
            value={form.nickname}
            onChangeText={(nickname) => set({ nickname })}
            placeholder="닉네임"
            aria-label="닉네임"
            maxLength={NICKNAME_MAX}
            autoComplete="nickname"
            autoFocus
            onSubmitEditing={onSubmit}
            submitBehavior="submit"
          />
          <Text variant="caption" className="mt-3 text-right">
            {form.nickname.length} / {NICKNAME_MAX}
          </Text>
        </>
      );
    case 3:
      return (
        <View className="gap-3" role="radiogroup">
          {(['ko', 'ja'] as const).map((l) => (
            <Choice key={l} label={langLabel[l]} selected={form.lang === l} onPress={() => set({ lang: l })} />
          ))}
        </View>
      );
    case 4:
      return (
        <View className="gap-3" role="radiogroup">
          {(
            [
              ['male', '남성'],
              ['female', '여성'],
            ] as const
          ).map(([g, label]) => (
            <Choice key={g} label={label} selected={form.gender === g} onPress={() => set({ gender: g })} />
          ))}
        </View>
      );
    default:
      return (
        <View className="flex-row gap-2">
          {(
            [
              ['y', '년', '1998', 4, 'flex-[1.6]'],
              ['m', '월', '03', 2, 'flex-1'],
              ['d', '일', '14', 2, 'flex-1'],
            ] as const
          ).map(([k, label, hint, max, flex], i) => (
            <View key={k} className={cn('min-w-0 gap-2', flex)}>
              <Text variant="caption" className="text-grey-700">
                {label}
              </Text>
              <Input
                className="px-0 text-center"
                value={form[k]}
                onChangeText={(v) => set({ [k]: v.replace(/\D/g, '') })}
                placeholder={hint}
                aria-label={label}
                keyboardType="number-pad"
                maxLength={max}
                autoFocus={i === 0}
              />
            </View>
          ))}
        </View>
      );
  }
}

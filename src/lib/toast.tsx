import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Text } from '@/ui/text';

type Toast = { message: string; error?: boolean };
let show: (t: Toast) => void = () => {};

export const showInfo = (message: string) => show({ message });
export const showError = (e: unknown) => {
  if (__DEV__) console.warn(e); // 원래 오류(서버의 영어 메시지)는 개발 콘솔에서 본다
  show({ message: errorText(e), error: true });
};

/** 서버 오류는 상태 코드로, fetch 자체가 실패하면(TypeError) 연결 오류로 */
// ponytail: 401은 지금 로그인 실패뿐이라 "이메일 또는 비밀번호" 문구. 토큰 만료가 생기면 경로로 나눈다.
function errorText(e: unknown) {
  if (e instanceof ApiError) return (t.errors.status as Record<number, string | undefined>)[e.status] ?? t.errors.unknown;
  if (e instanceof TypeError) return t.errors.network;
  return t.errors.unknown;
}

/** 루트 레이아웃에 하나만 둔다. 3초 뒤 사라지는 하단 알림. */
export function ToastHost() {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    show = (t) => {
      clearTimeout(timer);
      setToast(t);
      timer = setTimeout(() => setToast(null), 3000);
    };
    return () => clearTimeout(timer);
  }, []);
  if (!toast) return null;
  return (
    <View pointerEvents="none" className="absolute inset-x-0 bottom-24 items-center px-page">
      <View
        aria-live="polite"
        className={cn('max-w-[440px] rounded-md px-4 py-3', toast.error ? 'bg-destructive' : 'bg-grey-900')}>
        <Text variant="muted" className="text-white">
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';
import { Text } from '@/ui/text';

type Toast = { message: string; error?: boolean };
let show: (t: Toast) => void = () => {};

export const showInfo = (message: string) => show({ message });
export const showError = (e: unknown) => show({ message: e instanceof Error ? e.message : String(e), error: true });

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

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, text } from '@/ui/theme';

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
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.toast, toast.error && { backgroundColor: colors.danger }]} accessibilityLiveRegion="polite">
        <Text style={[text.sub, styles.text]}>{toast.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', paddingHorizontal: space.page },
  toast: { backgroundColor: colors.grey900, borderRadius: 12, paddingVertical: space.md, paddingHorizontal: space.lg, maxWidth: 440 },
  text: { color: colors.white },
});

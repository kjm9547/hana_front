import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMe } from '@/lib/session';
import { Button, Icon, Mascot, Screen } from '@/ui/components';
import { colors, space, text } from '@/ui/theme';

/** MATCH-02 매칭 대기: 탭바 없는 흐름 화면 */
// ponytail: 매칭 서버 전이라 대기 화면만. 시그널링 붙일 때 연결되면 MATCH-03(매칭 성공)으로 넘긴다.
export default function MatchWaitingScreen() {
  const me = useMe();
  const other = me.nativeLang === 'ko' ? '일본어' : '한국어';
  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => router.back()} style={styles.close}>
        <Icon name="x" size={24} color={colors.grey900} />
      </Pressable>
      <View style={styles.center}>
        <Mascot pose="looking" width={140} />
        <Text style={[text.section, { marginTop: space.sm }]}>{other} 원어민을 찾고 있어요</Text>
        <Text style={text.sub}>{other === '일본어' ? '相手を探しています' : '상대를 찾고 있어요'}</Text>
      </View>
      <View style={styles.footer}>
        <Button variant="secondary" title="그만 찾기" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', margin: space.xs },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingBottom: 80 },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.lg },
});

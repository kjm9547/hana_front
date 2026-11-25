import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/lib/session';
import { Avatar, Divider, Icon, langLabel, SectionHeader, TabPage } from '@/ui/components';
import { colors, font, space, text } from '@/ui/theme';

/** PROF-01 내 프로필 */
export default function ProfileTab() {
  const { me, signOut } = useSession();
  if (!me) return null; // 로그아웃 직후 화면이 사라지기 전 한 번
  return (
    <TabPage title="프로필">
      <View style={styles.head}>
        <Avatar name={me.nickname} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={text.section}>{me.nickname}</Text>
          <Text style={text.caption}>
            {langLabel[me.nativeLang]} 원어민 · {me.email}
          </Text>
        </View>
      </View>
      <Text style={[text.sub, { marginTop: space.lg }, !me.bio && { color: colors.grey500 }]}>
        {me.bio || '아직 자기소개가 없어요'}
      </Text>

      <SectionHeader title="계정" />
      <MenuRow label="자기소개 수정" onPress={() => router.push('/edit-bio')} />
      <Divider />
      <MenuRow label="로그아웃" danger onPress={signOut} />
    </TabPage>
  );
}

function MenuRow({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menu, pressed && { backgroundColor: colors.grey50 }]}>
      <Text style={[text.body, { flex: 1, fontFamily: font.medium }, danger && { color: colors.danger }]}>{label}</Text>
      {!danger && <Icon name="chevron-right" size={20} color={colors.grey500} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  menu: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.lg },
});

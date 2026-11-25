import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useMe } from '@/lib/session';
import { Button, Mascot, SectionHeader, TabPage } from '@/ui/components';
import { colors, font, space, text } from '@/ui/theme';

/** MATCH-01 랜덤매칭 안내 */
export default function MatchTab() {
  const me = useMe();
  const other = me.nativeLang === 'ko' ? '일본어' : '한국어';
  const steps = [`접속 중인 ${other} 원어민을 찾아요`, '연결되면 오늘의 표현으로 인사해요', '마음이 맞으면 친구 신청을 보내요'];

  return (
    <TabPage
      title="랜덤매칭"
      bottom={<Button title="랜덤 통화 시작" onPress={() => router.push('/match-waiting')} />}>
      <Mascot pose="sideeye" />
      <Text style={[text.section, { marginTop: space.lg }]}>{`지금 접속한 ${other} 원어민과\n바로 통화해요`}</Text>
      <Text style={[text.sub, { marginTop: space.sm }]}>처음엔 3분, 마음이 맞으면 더 길게</Text>
      <SectionHeader title="이렇게 진행돼요" />
      {steps.map((step, i) => (
        <View key={step} style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.sm }}>
          <Text style={[text.body, { width: 20, color: colors.primary }]}>{i + 1}</Text>
          <Text style={[text.body, { flex: 1, fontFamily: font.medium }]}>{step}</Text>
        </View>
      ))}
    </TabPage>
  );
}

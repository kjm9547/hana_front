import { router } from 'expo-router';
import { View } from 'react-native';

import { useMe } from '@/lib/session';
import { Button } from '@/ui/button';
import { Mascot, SectionHeader, TabPage } from '@/ui/hana';
import { Text } from '@/ui/text';

/** MATCH-01 랜덤매칭 안내 */
export default function MatchTab() {
  const me = useMe();
  const other = me.nativeLang === 'ko' ? '일본어' : '한국어';
  const steps = [`접속 중인 ${other} 원어민을 찾아요`, '연결되면 오늘의 표현으로 인사해요', '마음이 맞으면 친구 신청을 보내요'];

  return (
    <TabPage
      title="랜덤매칭"
      bottom={
        <Button size="lg" onPress={() => router.push('/match-waiting')}>
          <Text>랜덤 통화 시작</Text>
        </Button>
      }>
      <Mascot pose="sideeye" />
      <Text variant="section" className="mt-4">{`지금 접속한 ${other} 원어민과\n바로 통화해요`}</Text>
      <Text variant="sub" className="mt-2">
        처음엔 3분, 마음이 맞으면 더 길게
      </Text>
      <SectionHeader title="이렇게 진행돼요" />
      {steps.map((step, i) => (
        <View key={step} className="flex-row gap-3 py-2">
          <Text variant="body" className="w-5 text-primary">
            {i + 1}
          </Text>
          <Text variant="body" className="flex-1 font-medium">
            {step}
          </Text>
        </View>
      ))}
    </TabPage>
  );
}

import { router } from 'expo-router';
import { View } from 'react-native';

import { t } from '@/i18n';
import { Button } from '@/ui/button';
import { FieldScreen, Mascot } from '@/ui/hana';
import { Text } from '@/ui/text';

/** MATCH-01 랜덤매칭: 화면 전체가 색 면 + 곁눈질 펭귄 + 흰 버튼 하나 */
// ponytail: 매칭 옵션(거리·성별·언어 한 줄 요약 + 시트)은 매칭 API가 생기면 제목 아래에 붙인다.
export default function MatchTab() {
  return (
    <FieldScreen edges={['top']}>
      <View className="flex-1 px-page pt-11">
        <Text variant="display" className="text-white">
          {t.match.title}
        </Text>
        <View className="absolute right-[-8px] bottom-0">
          <Mascot pose="sideeye" width={280} />
        </View>
      </View>
      <View className="px-page pt-3 pb-5">
        <Button variant="onField" size="lg" onPress={() => router.push('/match-waiting')}>
          <Text>{t.match.start}</Text>
        </Button>
      </View>
    </FieldScreen>
  );
}

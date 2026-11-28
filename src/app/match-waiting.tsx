import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/ui/button';
import { FieldScreen, Mascot } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';

/** MATCH-02 매칭 대기: 탭바 없는 흐름 화면, 화면 전체가 색 면 + 두리번 펭귄 */
// ponytail: 매칭 서버 전이라 대기 화면만. 시그널링 붙일 때 연결되면 MATCH-03(매칭 성공)으로 넘긴다.
export default function MatchWaitingScreen() {
  return (
    <FieldScreen>
      <View className="h-14 justify-center px-2">
        <Button variant="ghost" size="icon" aria-label="닫기" onPress={() => router.back()} className="active:bg-white/10">
          <Icon as={X} className="size-6 text-white" />
        </Button>
      </View>
      <View className="flex-1 px-page pt-2">
        <Text variant="display" className="text-white">
          {'상대를\n찾고 있어요'}
        </Text>
        <View className="mt-auto mb-3 items-center">
          <Mascot pose="looking" width={300} />
        </View>
      </View>
      <View className="px-page pt-3 pb-5">
        <Button variant="ghost" onPress={() => router.back()} className="active:bg-white/10">
          <Text className="text-white">그만 찾기</Text>
        </Button>
      </View>
    </FieldScreen>
  );
}

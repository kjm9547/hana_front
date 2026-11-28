import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { View } from 'react-native';

import { useMe } from '@/lib/session';
import { Button } from '@/ui/button';
import { Mascot, Screen } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';

/** MATCH-02 매칭 대기: 탭바 없는 흐름 화면 */
// ponytail: 매칭 서버 전이라 대기 화면만. 시그널링 붙일 때 연결되면 MATCH-03(매칭 성공)으로 넘긴다.
export default function MatchWaitingScreen() {
  const me = useMe();
  const other = me.nativeLang === 'ko' ? '일본어' : '한국어';
  return (
    <Screen>
      <Button variant="ghost" size="icon" aria-label="닫기" onPress={() => router.back()} className="m-1">
        <Icon as={X} className="size-6 text-foreground" />
      </Button>
      <View className="flex-1 items-center justify-center gap-2 pb-20">
        <Mascot pose="looking" width={140} />
        <Text variant="section" className="mt-2">
          {other} 원어민을 찾고 있어요
        </Text>
        <Text variant="sub">{other === '일본어' ? '相手を探しています' : '상대를 찾고 있어요'}</Text>
      </View>
      <View className="px-6 pb-4">
        <Button variant="secondary" size="lg" onPress={() => router.back()}>
          <Text>그만 찾기</Text>
        </Button>
      </View>
    </Screen>
  );
}

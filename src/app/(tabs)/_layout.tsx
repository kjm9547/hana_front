import { Tabs } from 'expo-router/js-tabs';
import { FileText, House, type LucideIcon, MessageCircle, Shuffle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColor } from '@/ui/theme';

/** 바텀 탭 5개. 순서·이름을 바꾸려면 이 배열만 고친다 (name = 같은 폴더의 파일명). */
const tabs: [name: string, title: string, icon: LucideIcon][] = [
  ['index', '메인', House],
  ['chats', '대화방', MessageCircle],
  ['match', '랜덤매칭', Shuffle],
  ['board', '게시판', FileText],
  ['profile', '프로필', User],
];

/** 흰 바탕 + 위쪽 얇은 선, 선택된 탭만 포인트 컬러 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [primary, grey500, grey200, white] = [useColor('primary'), useColor('grey-500'), useColor('grey-200'), useColor('white')];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: white },
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: grey500,
        tabBarLabelStyle: { fontFamily: 'Pretendard-Medium', fontSize: 11, lineHeight: 16 },
        // 기본 높이(49)로는 Pretendard 라벨 아래가 잘려서 56 + 홈 인디케이터 영역
        tabBarStyle: { height: 56 + insets.bottom, backgroundColor: white, borderTopColor: grey200 },
      }}>
      {tabs.map(([name, title, TabIcon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color }) => <TabIcon size={22} color={color as string} /> }}
        />
      ))}
    </Tabs>
  );
}

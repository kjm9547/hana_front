import { Tabs } from 'expo-router/js-tabs';
import { FileText, House, type LucideIcon, MessageCircle, Shuffle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Text } from '@/ui/text';

import { useColor } from '@/ui/theme';

/** 바텀 탭 5개. 순서를 바꾸려면 이 배열만 고친다 (name = 같은 폴더의 파일명, 이름은 t.tabs). */
const tabs: [name: keyof typeof t.tabs, icon: LucideIcon][] = [
  ['index', House],
  ['chats', MessageCircle],
  ['match', Shuffle],
  ['board', FileText],
  ['profile', User],
];

/** 흰 바탕 + 위쪽 얇은 선, 선택된 탭만 포인트 컬러 + 굵게 */
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
        // 기본 높이(49)로는 Pretendard 라벨 아래가 잘려서 56 + 홈 인디케이터 영역
        tabBarStyle: { height: 56 + insets.bottom, backgroundColor: white, borderTopColor: grey200 },
      }}>
      {tabs.map(([name, TabIcon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t.tabs[name],
            tabBarIcon: ({ color }) => <TabIcon size={22} color={color as string} />,
            tabBarLabel: ({ focused }) => (
              <Text className={cn('text-tiny', focused ? 'font-bold text-primary' : 'font-medium text-grey-500')}>
                {t.tabs[name]}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

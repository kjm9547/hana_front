import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/ui/components';
import { colors, font } from '@/ui/theme';

/** 바텀 탭 5개. 순서·이름을 바꾸려면 이 배열만 고친다 (name = 같은 폴더의 파일명). */
const tabs: [name: string, title: string, icon: ComponentProps<typeof Icon>['name']][] = [
  ['index', '메인', 'home'],
  ['chats', '대화방', 'message-circle'],
  ['match', '랜덤매칭', 'shuffle'],
  ['board', '게시판', 'file-text'],
  ['profile', '프로필', 'user'],
];

/** 흰 바탕 + 위쪽 얇은 선, 선택된 탭만 포인트 컬러 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.white },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey500,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11, lineHeight: 16 },
        // 기본 높이(49)로는 Pretendard 라벨 아래가 잘려서 56 + 홈 인디케이터 영역
        tabBarStyle: { height: 56 + insets.bottom, backgroundColor: colors.white, borderTopColor: colors.grey200 },
      }}>
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color }) => <Icon name={icon} size={22} color={color as string} /> }}
        />
      ))}
    </Tabs>
  );
}

import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useSession } from '@/lib/session';
import { cn } from '@/lib/utils';
import { Avatar, langLabel, SectionHeader, TabPage } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Separator } from '@/ui/separator';
import { Text } from '@/ui/text';

/** PROF-01 내 프로필 */
export default function ProfileTab() {
  const { me, signOut } = useSession();
  if (!me) return null; // 로그아웃 직후 화면이 사라지기 전 한 번
  return (
    <TabPage title="프로필">
      <View className="flex-row items-center gap-4">
        <Avatar name={me.nickname} size={72} />
        <View className="flex-1 gap-0.5">
          <Text variant="section">{me.nickname}</Text>
          <Text variant="caption">
            {langLabel[me.nativeLang]} 원어민 · {me.email}
          </Text>
        </View>
      </View>
      <Text variant="sub" className={cn('mt-4', !me.bio && 'text-muted-foreground')}>
        {me.bio || '아직 자기소개가 없어요'}
      </Text>

      <SectionHeader title="계정" />
      <MenuRow label="자기소개 수정" onPress={() => router.push('/edit-bio')} />
      <Separator />
      <MenuRow label="로그아웃" danger onPress={signOut} />
    </TabPage>
  );
}

function MenuRow({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable role="button" onPress={onPress} className="flex-row items-center py-4 active:bg-grey-50">
      <Text variant="body" className={cn('flex-1 font-medium', danger && 'text-destructive')}>
        {label}
      </Text>
      {!danger && <Icon as={ChevronRight} className="text-muted-foreground" />}
    </Pressable>
  );
}

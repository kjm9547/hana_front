import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useSession } from '@/lib/session';
import { cn } from '@/lib/utils';
import { Avatar, FieldTabPage, langLabel } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Separator } from '@/ui/separator';
import { Text } from '@/ui/text';

/** PROF-01 내 프로필: 색 면에 아바타 + 이름, 아래 자기소개와 메뉴 */
export default function ProfileTab() {
  const { me, signOut } = useSession();
  if (!me) return null; // 로그아웃 직후 화면이 사라지기 전 한 번
  return (
    <FieldTabPage
      lead={<Avatar name={me.nickname} size={40} onField />}
      title={me.nickname}
      meta={`${langLabel[me.nativeLang]} 원어민 · ${me.email}`}>
      <Text variant="muted" className={cn('pt-2 pb-3', !me.bio && 'text-muted-foreground')}>
        {me.bio || '아직 자기소개가 없어요'}
      </Text>
      <Separator />
      <MenuRow label="자기소개 수정" onPress={() => router.push('/edit-bio')} />
      <Separator />
      <MenuRow label="로그아웃" danger onPress={signOut} />
    </FieldTabPage>
  );
}

function MenuRow({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable role="button" onPress={onPress} className="flex-row items-center py-4 active:bg-grey-50">
      <Text className={cn('flex-1 font-medium', danger && 'text-destructive')}>{label}</Text>
      {!danger && <Icon as={ChevronRight} className="text-muted-foreground" />}
    </Pressable>
  );
}

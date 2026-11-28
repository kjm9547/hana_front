import { router } from 'expo-router';

import type { Conversation } from '@/lib/api';
import { openChatRoom, useChatEvents } from '@/lib/chat';
import { useApi, useMe } from '@/lib/session';
import { chatTime } from '@/lib/time';
import { Button } from '@/ui/button';
import { EmptyState, FieldTabPage, ListRow, Spinner } from '@/ui/hana';
import { Text } from '@/ui/text';

/** CHAT-02 대화방 목록 */
export default function ChatsTab() {
  const me = useMe();
  const [res, reload] = useApi<{ items: Conversation[] }>('/conversations');
  // 새 메시지(내가 보낸 것 포함)나 재연결 때 다시 불러 순서·마지막 메시지를 맞춘다
  useChatEvents(reload, reload);

  return (
    <FieldTabPage title="대화방">
      {!res ? (
        <Spinner />
      ) : res.items.length === 0 ? (
        <EmptyState
          title="아직 대화가 없어요"
          subtitle="메인에서 친구를 골라 첫 인사를 건네보세요"
          action={
            <Button variant="secondary" onPress={() => router.navigate('/')}>
              <Text>친구 찾기</Text>
            </Button>
          }
        />
      ) : (
        res.items.map((c) => {
          const last = c.lastMessage;
          return (
            <ListRow
              key={c.id}
              name={c.partner.nickname}
              onPress={() => openChatRoom(c)}
              right={last && <Text variant="caption">{chatTime(last.createdAt)}</Text>}>
              <Text variant="strong" numberOfLines={1}>
                {c.partner.nickname}
              </Text>
              <Text variant="muted" className={last ? '' : 'text-muted-foreground'} numberOfLines={1}>
                {last ? `${last.senderId === me.id ? '나: ' : ''}${last.body}` : '첫 인사를 건네보세요'}
              </Text>
            </ListRow>
          );
        })
      )}
    </FieldTabPage>
  );
}

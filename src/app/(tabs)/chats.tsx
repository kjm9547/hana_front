import { router } from 'expo-router';

import { t } from '@/i18n';
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
    <FieldTabPage title={t.tabs.chats}>
      {!res ? (
        <Spinner />
      ) : res.items.length === 0 ? (
        <EmptyState
          title={t.chats.empty}
          subtitle={t.chats.emptySub}
          action={
            <Button variant="secondary" onPress={() => router.navigate('/')}>
              <Text>{t.chats.findFriends}</Text>
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
                {last ? `${last.senderId === me.id ? t.chats.mine : ''}${last.body}` : t.chats.noMessage}
              </Text>
            </ListRow>
          );
        })
      )}
    </FieldTabPage>
  );
}

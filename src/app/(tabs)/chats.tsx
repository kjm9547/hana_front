import { router } from 'expo-router';
import { Fragment } from 'react';
import { Text } from 'react-native';

import type { Conversation } from '@/lib/api';
import { openChatRoom, useChatEvents } from '@/lib/chat';
import { useApi, useMe } from '@/lib/session';
import { chatTime } from '@/lib/time';
import { Button, EmptyState, ListRow, RowDivider, Spinner, TabPage } from '@/ui/components';
import { colors, text } from '@/ui/theme';

/** CHAT-01 대화방 목록 */
export default function ChatsTab() {
  const me = useMe();
  const [res, reload] = useApi<{ items: Conversation[] }>('/conversations');
  // 새 메시지(내가 보낸 것 포함)나 재연결 때 다시 불러 순서·마지막 메시지를 맞춘다
  useChatEvents(reload, reload);

  if (!res) return <TabPage title="대화방"><Spinner /></TabPage>;
  return (
    <TabPage title="대화방">
      {res.items.length === 0 ? (
        <EmptyState
          title="아직 대화가 없어요"
          subtitle="메인에서 친구를 골라 첫 인사를 건네보세요"
          action={<Button variant="outline" size="md" title="친구 찾기" onPress={() => router.navigate('/')} />}
        />
      ) : (
        res.items.map((c, i) => {
          const last = c.lastMessage;
          return (
            <Fragment key={c.id}>
              {i > 0 && <RowDivider />}
              <ListRow
                name={c.partner.nickname}
                onPress={() => openChatRoom(c)}
                right={last && <Text style={text.caption}>{chatTime(last.createdAt)}</Text>}>
                <Text style={text.body} numberOfLines={1}>
                  {c.partner.nickname}
                </Text>
                <Text style={[text.sub, !last && { color: colors.grey500 }]} numberOfLines={1}>
                  {last ? `${last.senderId === me.id ? '나: ' : ''}${last.body}` : '첫 인사를 건네보세요'}
                </Text>
              </ListRow>
            </Fragment>
          );
        })
      )}
    </TabPage>
  );
}

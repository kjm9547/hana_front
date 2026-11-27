import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronLeft } from 'lucide-react-native';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';

import { t } from '@/i18n';
import { api, type Lang, type Message, type Page } from '@/lib/api';
import { useChatEvents } from '@/lib/chat';
import { useMe } from '@/lib/session';
import { clockLabel, dayLabel, daysAgo } from '@/lib/time';
import { showError } from '@/lib/toast';
import { Button } from '@/ui/button';
import { ChatBubble, EmptyState, Screen, Spinner } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Input } from '@/ui/input';
import { Text } from '@/ui/text';

/** CHAT-03 대화 상세. 보내기는 REST, 받기는 소켓. */
export default function ChatRoomScreen() {
  const me = useMe();
  const params = useLocalSearchParams<{ id: string; nickname: string; nativeLang: Lang }>();
  const conversationId = Number(params.id);
  const path = `/conversations/${conversationId}/messages`;

  /** 최신순. 화면은 뒤집힌(inverted) 리스트라 0번이 맨 아래. null = 아직 불러오는 중 */
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  /** 더 오래된 메시지를 불러올 기준 id. null이면 끝까지 다 불러옴 */
  const cursor = useRef<number | null>(null);
  const loadingOlder = useRef(false);

  const merge = (items: Message[]) => setMessages((prev) => mergeById(prev, items));
  const latest = () => api<Page<Message>>('GET', `${path}?limit=30`);

  useEffect(() => {
    api<Page<Message>>('GET', `${path}?limit=30`).then((page) => {
      cursor.current = page.nextCursor;
      setMessages((prev) => mergeById(prev, page.items));
    }, showError);
  }, [path]);

  useChatEvents(
    (m) => m.conversationId === conversationId && merge([m]),
    () => latest().then((page) => merge(page.items), showError), // 끊긴 사이 놓친 메시지
  );

  const loadOlder = async () => {
    if (cursor.current === null || loadingOlder.current) return;
    loadingOlder.current = true;
    try {
      const page = await api<Page<Message>>('GET', `${path}?limit=30&before=${cursor.current}`);
      cursor.current = page.nextCursor;
      merge(page.items);
    } catch (e) {
      showError(e);
    } finally {
      loadingOlder.current = false;
    }
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      merge([await api<Message>('POST', path, { body })]);
      setDraft('');
    } catch (e) {
      showError(e); // 입력한 글은 지우지 않는다
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <View className="h-14 flex-row items-center gap-1 pr-page pl-2">
        <Button variant="ghost" size="icon" aria-label={t.chat.back} onPress={() => router.back()}>
          <Icon as={ChevronLeft} className="size-6 text-foreground" />
        </Button>
        <Text variant="strong" className="flex-1 font-bold" numberOfLines={1}>
          {params.nickname}
        </Text>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {messages === null ? (
          <View className="flex-1">
            <Spinner />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1">
            <EmptyState title={t.chat.empty(params.nickname)} subtitle={t.chat.emptySub} />
          </View>
        ) : (
          <MessageList messages={messages} meId={me.id} onEndReached={loadOlder} />
        )}

        <View className="flex-row items-center gap-2 px-3 pt-2 pb-3">
          {/* ponytail: 한 줄 입력이라 Enter로 바로 보낸다. 여러 줄이 필요해지면 multiline + 보내기 버튼만으로. */}
          <Input
            className="h-11 flex-1 rounded-full px-4"
            value={draft}
            onChangeText={setDraft}
            placeholder={t.chat.placeholder}
            aria-label={t.chat.placeholder}
            maxLength={1000}
            onSubmitEditing={send}
            submitBehavior="submit"
          />
          <Button size="icon" aria-label={t.chat.send} disabled={sending} onPress={send}>
            <Icon as={ArrowUp} />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** 소켓·REST 응답이 같은 메시지를 두 번 줄 수 있어서 id로 합친다 (최신순) */
function mergeById(prev: Message[] | null, items: Message[]) {
  const byId = new Map((prev ?? []).map((m) => [m.id, m]));
  for (const m of items) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => b.id - a.id);
}

/** 메시지 목록: 날짜가 바뀌면 구분선, 같은 사람이 같은 분에 보낸 묶음은 촘촘하게 + 마지막에만 시간 */
function MessageList({ messages, meId, onEndReached }: { messages: Message[]; meId: number; onEndReached: () => void }) {
  const now = new Date();
  const minute = (m: Message) => Math.floor(Date.parse(m.createdAt) / 60_000);

  return (
    <FlatList
      inverted
      data={messages}
      keyExtractor={(m) => String(m.id)}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      contentContainerClassName="px-page py-4"
      renderItem={({ item: m, index: i }) => {
        // 최신순이라 i+1이 바로 앞(더 오래된) 메시지, i-1이 바로 뒤 메시지
        const prev = messages[i + 1];
        const next = messages[i - 1];
        const at = new Date(m.createdAt);
        const newDay = !prev || daysAgo(new Date(prev.createdAt), at) !== 0;
        const sameGroup = (o?: Message) => !!o && o.senderId === m.senderId && minute(o) === minute(m);
        return (
          <View>
            {newDay && <DayDivider label={dayLabel(at, now)} />}
            {/* 말하는 사람이 바뀌면 넓게, 이어 보낸 묶음은 촘촘하게 */}
            <View className={newDay ? '' : sameGroup(prev) ? 'pt-1' : 'pt-3'}>
              <ChatBubble body={m.body} mine={m.senderId === meId} time={sameGroup(next) ? undefined : clockLabel(at)} />
            </View>
          </View>
        );
      }}
    />
  );
}

/** 날짜가 바뀌는 곳에 넣는 가운데 날짜 (선 없이 글자만) */
function DayDivider({ label }: { label: string }) {
  return (
    <Text variant="caption" className="py-3 text-center">
      {label}
    </Text>
  );
}

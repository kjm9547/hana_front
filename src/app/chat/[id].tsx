import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { api, type Lang, type Message, type Page } from '@/lib/api';
import { useChatEvents } from '@/lib/chat';
import { useMe } from '@/lib/session';
import { clockLabel, dayLabel, daysAgo } from '@/lib/time';
import { showError } from '@/lib/toast';
import { Avatar, ChatBubble, EmptyState, Icon, Input, langLabel, Screen, Spinner } from '@/ui/components';
import { colors, radius, space, text } from '@/ui/theme';

/** CHAT-02 채팅방. 보내기는 REST, 받기는 소켓. */
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
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Icon name="chevron-left" size={24} color={colors.grey900} />
        </Pressable>
        <Avatar name={params.nickname} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={text.body} numberOfLines={1}>
            {params.nickname}
          </Text>
          <Text style={text.caption}>{langLabel[params.nativeLang]} 원어민</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {messages === null ? (
          <View style={{ flex: 1 }}>
            <Spinner />
          </View>
        ) : messages.length === 0 ? (
          <View style={{ flex: 1 }}>
            <EmptyState title={`${params.nickname}님과의 첫 대화예요`} subtitle="정성 어린 첫 인사를 건네보세요" />
          </View>
        ) : (
          <MessageList messages={messages} meId={me.id} onEndReached={loadOlder} />
        )}

        <View style={styles.inputBar}>
          {/* ponytail: 한 줄 입력이라 Enter로 바로 보낸다. 여러 줄이 필요해지면 multiline + 보내기 버튼만으로. */}
          <Input
            style={{ flex: 1 }}
            value={draft}
            onChangeText={setDraft}
            placeholder="메시지를 입력하세요"
            maxLength={1000}
            onSubmitEditing={send}
            submitBehavior="submit"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="보내기"
            disabled={sending}
            onPress={send}
            style={({ pressed }) => [styles.send, (pressed || sending) && { opacity: 0.6 }]}>
            <Icon name="send" size={20} color={colors.white} />
          </Pressable>
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
      contentContainerStyle={styles.list}
      renderItem={({ item: m, index: i }) => {
        // 최신순이라 i+1이 바로 앞(더 오래된) 메시지, i-1이 바로 뒤 메시지
        const prev = messages[i + 1];
        const next = messages[i - 1];
        const t = new Date(m.createdAt);
        const newDay = !prev || daysAgo(new Date(prev.createdAt), t) !== 0;
        const sameGroup = (o?: Message) => !!o && o.senderId === m.senderId && minute(o) === minute(m);
        return (
          <View>
            {newDay && <DayDivider label={dayLabel(t, now)} />}
            {/* 말하는 사람이 바뀌면 넓게, 이어 보낸 묶음은 촘촘하게 */}
            <View style={{ paddingTop: newDay ? 0 : sameGroup(prev) ? space.xs : space.md }}>
              <ChatBubble body={m.body} mine={m.senderId === meId} time={sameGroup(next) ? undefined : clockLabel(t)} />
            </View>
          </View>
        );
      }}
    />
  );
}

/** 날짜가 바뀌는 곳에 넣는 가운데 정렬 구분선 */
function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.day}>
      <View style={styles.dayLine} />
      <Text style={text.caption}>{label}</Text>
      <View style={styles.dayLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.sm,
    paddingRight: space.page,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grey200,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: space.page, paddingVertical: space.lg },
  day: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  dayLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.grey200 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.page,
    paddingRight: space.md,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grey200,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: radius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

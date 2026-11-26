import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUp, ChevronLeft, Heart, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { api, assetUrl, type Conversation, type PostComment, type PostDetail } from '@/lib/api';
import { openChatRoom } from '@/lib/chat';
import { useApi, useMe } from '@/lib/session';
import { agoLabel } from '@/lib/time';
import { showError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Avatar, Screen, Spinner } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';
import { Text } from '@/ui/text';
import { useColor } from '@/ui/theme';

/** 지우기 전에 한 번 묻는다 (웹은 Alert가 없어서 confirm) */
const confirmDelete = (onYes: () => void) =>
  Platform.OS === 'web'
    ? window.confirm('이 글을 지울까요?') && onYes()
    : Alert.alert('이 글을 지울까요?', '댓글과 좋아요도 함께 지워져요', [
        { text: '취소', style: 'cancel' },
        { text: '지우기', style: 'destructive', onPress: onYes },
      ]);

/** BOARD-03 글 상세: 작성자 · 대화하기 · 본문 · 좋아요 · 댓글. 내 글이면 지우기. */
// ponytail: 번역 보기 · 답글은 v1 제외.
export default function PostScreen() {
  const me = useMe();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, reload] = useApi<PostDetail>(`/posts/${id}`);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const primary = useColor('primary');

  const toggleLike = async () => {
    if (!post) return;
    try {
      await api(post.likedByMe ? 'DELETE' : 'PUT', `/posts/${post.id}/like`);
      await reload();
    } catch (e) {
      showError(e);
    }
  };

  const sendComment = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api<PostComment>('POST', `/posts/${id}/comments`, { body });
      setDraft('');
      await reload();
    } catch (e) {
      showError(e); // 입력한 글은 지우지 않는다
    } finally {
      setSending(false);
    }
  };

  const startChat = async () => {
    if (!post) return;
    try {
      openChatRoom(await api<Conversation>('POST', '/conversations', { partnerId: post.author.id }));
    } catch (e) {
      showError(e);
    }
  };

  const remove = () =>
    confirmDelete(async () => {
      try {
        await api('DELETE', `/posts/${id}`);
        router.back();
      } catch (e) {
        showError(e);
      }
    });

  const mine = post?.author.id === me.id;
  return (
    <Screen>
      <View className="h-14 flex-row items-center justify-between px-2">
        <Button variant="ghost" size="icon" aria-label="게시판으로" onPress={() => router.back()}>
          <Icon as={ChevronLeft} className="size-6 text-foreground" />
        </Button>
        {mine && (
          <Button variant="ghost" size="icon" aria-label="글 지우기" onPress={remove}>
            <Icon as={Trash2} className="size-[22px] text-foreground" />
          </Button>
        )}
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!post ? (
          <View className="flex-1">
            <Spinner />
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerClassName="px-page pb-6" keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center gap-3 pt-1 pb-3">
              <Avatar name={post.author.nickname} />
              <View className="flex-1">
                <Text variant="strong" numberOfLines={1}>
                  {post.author.nickname}
                </Text>
                <Text variant="caption">{agoLabel(post.createdAt)}</Text>
              </View>
              {!mine && (
                <Button variant="secondary" onPress={startChat}>
                  <Text>대화하기</Text>
                </Button>
              )}
            </View>

            {post.images.length > 0 && <Photos urls={post.images} alt={post.title} />}
            <Text variant="strong" className="mt-4 font-bold">
              {post.title}
            </Text>
            <Text variant="sub" className="mt-1.5">
              {post.body}
            </Text>

            <View className="mt-2 flex-row justify-end">
              <Pressable
                role="button"
                aria-label={post.likedByMe ? '좋아요 취소' : '좋아요'}
                aria-pressed={post.likedByMe}
                onPress={toggleLike}
                className="h-11 flex-row items-center gap-1">
                <Icon
                  as={Heart}
                  fill={post.likedByMe ? primary : 'none'}
                  className={cn('size-[18px]', post.likedByMe ? 'text-primary' : 'text-grey-700')}
                />
                <Text variant="sub" className="font-semibold text-grey-700">
                  {post.likeCount}
                </Text>
              </Pressable>
            </View>
            <Separator className="mt-2" />

            <Text variant="sub" className="mt-4 font-bold">
              댓글 {post.commentCount}
            </Text>
            {post.comments.map((c) => (
              <View key={c.id} className="flex-row gap-2 pt-3">
                <Avatar name={c.author.nickname} size={32} />
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-baseline gap-2">
                    <Text variant="caption" className="font-bold text-foreground">
                      {c.author.nickname}
                    </Text>
                    <Text variant="caption">{agoLabel(c.createdAt)}</Text>
                  </View>
                  <Text variant="sub">{c.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="flex-row items-center gap-2 pt-2 pr-3 pb-3 pl-page">
          <Input
            className="h-11 flex-1 rounded-full px-4"
            value={draft}
            onChangeText={setDraft}
            placeholder="댓글 달기"
            aria-label="댓글"
            maxLength={1000}
            onSubmitEditing={sendComment}
            submitBehavior="submit"
          />
          <Button size="icon" aria-label="댓글 등록" disabled={sending || !draft.trim()} onPress={sendComment}>
            <Icon as={ArrowUp} />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** 사진 넘겨 보기: 옆으로 밀면 한 장씩, 오른쪽 아래에 "2 / 3" */
function Photos({ urls, alt }: { urls: string[]; alt: string }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const height = (width * 9) / 16;
  return (
    <View
      className="mt-2 overflow-hidden rounded-md bg-grey-100"
      style={{ height: height || undefined, aspectRatio: width ? undefined : 16 / 9 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {urls.map((u, i) => (
            <Image
              key={u}
              source={assetUrl(u)}
              style={{ width, height }}
              contentFit="cover"
              accessibilityLabel={`${alt} 사진 ${i + 1}`}
            />
          ))}
        </ScrollView>
      )}
      {urls.length > 1 && (
        <View className="absolute right-3 bottom-3 rounded-[10px] bg-grey-900/60 px-2 py-1">
          <Text variant="caption" className="text-white">
            {index + 1} / {urls.length}
          </Text>
        </View>
      )}
    </View>
  );
}

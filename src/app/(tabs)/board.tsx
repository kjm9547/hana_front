import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Heart, MessageCircle, SquarePen } from 'lucide-react-native';
import { Fragment, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { assetUrl, type Page, type Post } from '@/lib/api';
import { useApi } from '@/lib/session';
import { agoLabel } from '@/lib/time';
import { Button } from '@/ui/button';
import { Avatar, EmptyState, FieldTabPage, Spinner } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Separator } from '@/ui/separator';
import { Text } from '@/ui/text';

/** BOARD-02 게시판 목록: 헤더 오른쪽에 글쓰기 */
// ponytail: 첫 페이지(20개)만. 글이 늘면 nextCursor로 무한 스크롤.
export default function BoardTab() {
  const [page, reload] = useApi<Page<Post>>('/posts?limit=20');
  // 글을 쓰거나 지우고 돌아오면 다시 불러온다
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <FieldTabPage
      title="게시판"
      trailing={
        <Button
          variant="ghost"
          size="icon"
          aria-label="글쓰기"
          className="-mr-2.5 active:bg-white/10"
          onPress={() => router.push('/post/write')}>
          <Icon as={SquarePen} className="size-[22px] text-white" />
        </Button>
      }>
      {!page ? (
        <Spinner />
      ) : page.items.length === 0 ? (
        <EmptyState title="아직 글이 없어요" subtitle="첫 번째 글을 올려보세요" />
      ) : (
        page.items.map((p, i) => (
          <Fragment key={p.id}>
            {i > 0 && <Separator />}
            <PostRow post={p} />
          </Fragment>
        ))
      )}
    </FieldTabPage>
  );
}

/**
 * 글 한 줄: 왼쪽에 아바타 칸, 오른쪽 한 칸에 작성자 · 제목 · 본문 두 줄 · 첫 사진 · 댓글/좋아요 수.
 * 오른쪽 내용은 모두 같은 왼쪽 선(작성자 이름)에서 시작한다.
 */
function PostRow({ post }: { post: Post }) {
  return (
    <Pressable onPress={() => router.push(`/post/${post.id}`)} className="flex-row gap-3 py-4 active:bg-grey-50">
      <Avatar name={post.author.nickname} size={32} />
      <View className="flex-1 gap-1.5">
        {/* 아바타(32)와 같은 높이로 맞춰 이름이 아바타 가운데에 온다 */}
        <View className="h-8 flex-row items-center gap-2">
          <Text variant="caption" className="font-bold text-foreground">
            {post.author.nickname}
          </Text>
          <Text variant="caption">{agoLabel(post.createdAt)}</Text>
        </View>
        <View className="gap-0.5">
          <Text variant="sub" className="font-bold" numberOfLines={1}>
            {post.title}
          </Text>
          <Text variant="sub" className="text-grey-700" numberOfLines={2}>
            {post.body}
          </Text>
        </View>
        {post.images.length > 0 && (
          <View className="mt-1.5">
            <Image
              source={assetUrl(post.images[0])}
              style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 14 }}
              contentFit="cover"
              accessibilityLabel={`${post.title} 사진`}
            />
            {post.images.length > 1 && (
              <View className="absolute right-3 bottom-3 rounded-[10px] bg-grey-900/60 px-2 py-1">
                <Text variant="caption" className="text-white">
                  1 / {post.images.length}
                </Text>
              </View>
            )}
          </View>
        )}
        <View className="mt-1.5 flex-row items-center gap-1">
          <Icon as={MessageCircle} className="size-4 text-grey-500" />
          <Text variant="caption">{post.commentCount}</Text>
          <Icon as={Heart} className="ml-3 size-4 text-grey-500" />
          <Text variant="caption">{post.likeCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

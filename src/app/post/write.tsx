import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ImagePlus, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { api, type PostDetail, uploadImage } from '@/lib/api';
import { showError } from '@/lib/toast';
import { Button } from '@/ui/button';
import { Screen } from '@/ui/hana';
import { Icon } from '@/ui/icon';
import { Input } from '@/ui/input';
import { Text } from '@/ui/text';
import { Textarea } from '@/ui/textarea';

const MAX_PHOTOS = 10;

/** 고른 사진: 고르자마자 올리고, 올라가면 서버 id가 생긴다 */
type Photo = { key: string; uri: string; id?: number };

/** BOARD-04 글쓰기 (모달): 제목 · 본문 · 사진 최대 10장. 올리면 그 글 상세로. */
export default function WriteScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const uploading = photos.some((p) => p.id === undefined);
  const ok = title.trim() !== '' && body.trim() !== '' && !uploading;

  const addPhotos = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8, // iOS의 HEIC도 JPEG로 받는다 (서버는 JPEG·PNG·WebP만)
    });
    if (picked.canceled) return;
    const added = picked.assets.slice(0, MAX_PHOTOS - photos.length).map((asset) => ({ asset, key: asset.uri }));
    setPhotos((prev) => [...prev, ...added.map(({ asset, key }) => ({ key, uri: asset.uri }))]);
    for (const { asset, key } of added) {
      uploadImage(asset).then(
        ({ id }) => setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, id } : p))),
        (e) => {
          showError(e);
          setPhotos((prev) => prev.filter((p) => p.key !== key));
        },
      );
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const post = await api<PostDetail>('POST', '/posts', { title, body, imageIds: photos.map((p) => p.id) });
      router.replace(`/post/${post.id}`);
    } catch (e) {
      showError(e);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View className="h-14 flex-row items-center gap-1 pr-page pl-2">
        <Button variant="ghost" size="icon" aria-label="닫기" onPress={() => router.back()}>
          <Icon as={X} className="size-6 text-foreground" />
        </Button>
        <Text variant="strong" className="flex-1 font-bold">
          글쓰기
        </Text>
        <Button className="px-4" disabled={!ok || busy} onPress={submit}>
          <Text>올리기</Text>
        </Button>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-page pt-3 pb-5">
          <Input
            className="h-12 px-4 font-semibold text-sub"
            value={title}
            onChangeText={setTitle}
            placeholder="제목"
            aria-label="제목"
            maxLength={100}
          />
          <Textarea
            className="mt-3 flex-1 p-4 text-sub"
            value={body}
            onChangeText={setBody}
            placeholder="한국어도 일본어도 괜찮아요"
            aria-label="내용"
            maxLength={5000}
          />

          <Text variant="caption" className="mt-5 text-grey-700">
            사진 {photos.length} / {MAX_PHOTOS}
          </Text>
          {/* 지우기 배지가 사진 밖으로 8 나와서 위·오른쪽 여백을 둔다 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="grow-0"
            contentContainerClassName="items-start gap-3 pt-3 pr-2">
            {photos.length < MAX_PHOTOS && (
              <Pressable
                role="button"
                aria-label="사진 추가"
                onPress={addPhotos}
                className="size-[72px] items-center justify-center rounded-md bg-grey-100 active:bg-grey-200">
                <Icon as={ImagePlus} className="size-[22px] text-grey-700" />
              </Pressable>
            )}
            {photos.map((p, i) => (
              <View key={p.key} className="size-[72px]">
                <Image source={p.uri} style={{ width: 72, height: 72, borderRadius: 14 }} contentFit="cover" />
                {p.id === undefined && (
                  <View className="absolute inset-0 items-center justify-center rounded-md bg-grey-900/40">
                    <ActivityIndicator colorClassName="accent-white" />
                  </View>
                )}
                <Pressable
                  role="button"
                  aria-label={`사진 ${i + 1} 빼기`}
                  onPress={() => setPhotos((prev) => prev.filter((x) => x.key !== p.key))}
                  hitSlop={8}
                  className="absolute -top-2 -right-2 size-6 items-center justify-center rounded-full border-2 border-white bg-grey-900">
                  <Icon as={X} className="size-3 text-white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

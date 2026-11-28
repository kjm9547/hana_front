import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import type { Lang, User } from '@/lib/api';
import { cn } from '@/lib/utils';

import { LookingPenguin } from './looking';
import { Text } from './text';

// Hana에서만 쓰는 화면 부품. 버튼·입력 같은 기본 부품은 Reusables(button.tsx, input.tsx …)를 쓴다.

export const langLabel: Record<Lang, string> = { ko: '한국어', ja: '日本語' };

const SafeAreaView = withUniwind(RNSafeAreaView);

// ───────────────────────── 화면 틀 ─────────────────────────

/** 흰 바탕 + 안전 영역 + 최대 폭 600 가운데 정렬. 모든 화면의 바깥 틀. */
export function Screen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: Edge[] }) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <View className="w-full max-w-[600px] flex-1 self-center">{children}</View>
    </SafeAreaView>
  );
}

// 색 면 화면이 하나라도 보이는 동안 상태 표시줄 글자를 흰색으로.
// 화면을 옮길 때 focus·blur 순서가 섞여도 맞도록 보이는 색 면 화면 수를 센다.
let fieldScreens = 0;
function useLightStatusBar() {
  useFocusEffect(
    useCallback(() => {
      fieldScreens += 1;
      StatusBar.setStyle('light');
      return () => {
        fieldScreens -= 1;
        if (fieldScreens === 0) StatusBar.setStyle('dark');
      };
    }, []),
  );
}

/**
 * 색 면 탭 틀 (개편 방향 A): 위쪽 색 면 헤더에 제목, 아래는 흰 바탕 스크롤 본문.
 * 헤더 높이는 내용과 상관없이 항상 56 (+ 상태 표시줄). 색 면이 상태 표시줄 뒤까지 채운다.
 * lead는 제목 왼쪽(프로필 아바타 등, 40 이하), meta는 제목 아래 한 줄, trailing은 오른쪽 끝 행동(아이콘 버튼 44 이하).
 */
export function FieldTabPage(props: {
  lead?: ReactNode;
  title: string;
  meta?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  return (
    <View className="flex-1 bg-background">
      <View className="bg-primary" style={{ paddingTop: insets.top }}>
        <View className="h-14 w-full max-w-[600px] flex-row items-center gap-3 self-center px-page">
          {props.lead}
          <View className="flex-1">
            <Text variant="title" className="text-white" numberOfLines={1}>
              {props.title}
            </Text>
            {props.meta && (
              <Text variant="caption" className="text-white" numberOfLines={1}>
                {props.meta}
              </Text>
            )}
          </View>
          {props.trailing}
        </View>
      </View>
      <ScrollView className="w-full max-w-[600px] flex-1 self-center" contentContainerClassName="px-page pt-3 pb-8">
        {props.children}
      </ScrollView>
    </View>
  );
}

/** 순간 화면 틀 (매칭 · 대기 · 성공): 화면 전체가 색 면 + 흰 글자 상태 표시줄 */
export function FieldScreen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: Edge[] }) {
  useLightStatusBar();
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-primary">
      <View className="w-full max-w-[600px] flex-1 self-center">{children}</View>
    </SafeAreaView>
  );
}

export function Spinner() {
  return <ActivityIndicator colorClassName="accent-primary" className="mt-20" />;
}

/** 선택지: 회색 면 한 줄, 선택되면 포인트 면 + 흰 글자 (가입 퍼널의 모국어·성별) */
export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      onPress={onPress}
      className={cn('h-14 justify-center rounded-md px-5', selected ? 'bg-primary' : 'bg-grey-100 active:bg-grey-200')}>
      <Text variant="strong" className={cn(selected && 'text-white')}>
        {label}
      </Text>
    </Pressable>
  );
}

// ───────────────────────── 마스코트 · 아바타 ─────────────────────────

const mascots = {
  idle: require('../../assets/mascot/idle.svg'),
  hello: require('../../assets/mascot/hello.svg'),
  sideeye: require('../../assets/mascot/sideeye.svg'),
  surprised: require('../../assets/mascot/surprised.svg'),
};
export type Pose = keyof typeof mascots | 'looking';

/** 마스코트 펭귄. 화면마다 한 마리만. looking은 두리번거리는 애니메이션. */
export function Mascot({ pose, width = 96 }: { pose: Pose; width?: number }) {
  const size = { width, height: (width * 280) / 240 };
  if (pose === 'looking') return <LookingPenguin {...size} />;
  return <Image source={mascots[pose]} style={size} contentFit="contain" accessible={false} />;
}

/** 사진이 생기기 전까지 쓰는 이니셜 아바타. 중립 회색, 색 면 위(onField)에서는 흰 바탕. */
export function Avatar({ name, size = 48, onField }: { name: string; size?: number; onField?: boolean }) {
  return (
    <View
      className={cn('items-center justify-center rounded-full', onField ? 'bg-white' : 'bg-grey-100')}
      style={{ width: size, height: size }}>
      <Text
        className={cn('font-bold', onField ? 'text-primary-strong' : 'text-grey-700')}
        style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {[...name][0]}
      </Text>
    </View>
  );
}

// ───────────────────────── 목록 행 ─────────────────────────

/** 목록 행 공통: 아바타 + 가운데 내용 + 오른쪽(선택). 누르면 옅은 회색. */
export function ListRow(props: { name: string; children: ReactNode; right?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={props.onPress} className="flex-row items-center gap-3 py-3 active:bg-grey-50">
      <Avatar name={props.name} />
      <View className="flex-1 gap-0.5">{props.children}</View>
      {props.right}
    </Pressable>
  );
}

/** 사람 행: 이름 + 자기소개 두 줄까지 */
export function PersonRow({ person, onPress }: { person: User; onPress?: () => void }) {
  return (
    <ListRow name={person.nickname} onPress={onPress}>
      <Text variant="strong" numberOfLines={1}>
        {person.nickname}
      </Text>
      {person.bio !== '' && (
        <Text variant="muted" numberOfLines={2}>
          {person.bio}
        </Text>
      )}
    </ListRow>
  );
}

// ───────────────────────── 빈 화면 · 말풍선 ─────────────────────────

/** 빈 화면: 펭귄 + 제목 + 설명 + (선택) 버튼 하나 */
export function EmptyState({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <View className="items-center gap-2 py-20">
      <Mascot pose="idle" width={120} />
      <Text variant="title" className="mt-2 text-center">
        {title}
      </Text>
      <Text variant="muted" className="text-center">
        {subtitle}
      </Text>
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}

/**
 * 채팅 말풍선: 내 메시지는 오른쪽 포인트 컬러, 상대는 왼쪽 회색.
 * time은 말풍선 옆 아래에 작게 (내 말은 왼쪽, 상대 말은 오른쪽).
 */
export function ChatBubble({ body, mine, time }: { body: string; mine: boolean; time?: string }) {
  const stamp = time && <Text className="font-medium text-tiny text-muted-foreground">{time}</Text>;
  return (
    <View className={cn('flex-row items-end gap-1', mine ? 'justify-end' : 'justify-start')}>
      {mine && stamp}
      <View
        className={cn(
          'max-w-[270px] shrink rounded-lg px-3.5 py-3',
          mine ? 'rounded-br-[6px] bg-primary' : 'rounded-bl-[6px] bg-grey-100',
        )}>
        <Text className={mine ? 'text-white' : 'text-foreground'}>
          {body}
        </Text>
      </View>
      {!mine && stamp}
    </View>
  );
}

import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import type { Lang, Phrase, User } from '@/lib/api';
import { cn } from '@/lib/utils';

import { LookingPenguin } from './looking';
import { Separator } from './separator';
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

/** 탭 공통 틀: 큰 제목 + 스크롤 본문 (+ 하단 고정 바) */
export function TabPage({ title, children, bottom }: { title: string; children: ReactNode; bottom?: ReactNode }) {
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerClassName="px-page pt-4 pb-8">
        <Text variant="title" className="mb-6">
          {title}
        </Text>
        {children}
      </ScrollView>
      {bottom && <View className="border-t border-border px-page py-3">{bottom}</View>}
    </Screen>
  );
}

export function Spinner() {
  return <ActivityIndicator colorClassName="accent-primary" className="mt-20" />;
}

/** 목록 행 사이 구분선 (아바타 52 + 간격 16만큼 들여쓰기) */
export const RowDivider = () => <Separator className="ml-17" />;

/** 선택 카드: 선택되면 포인트 테두리 + 옅은 포인트 면 */
export function ChoiceCard(props: { title: string; subtitle: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      role="radio"
      aria-checked={props.selected}
      onPress={props.onPress}
      className={cn(
        'flex-1 gap-0.5 rounded-lg border border-border p-4',
        props.selected && 'border-[1.5px] border-primary bg-primary-soft',
      )}>
      <Text variant="body">{props.title}</Text>
      <Text variant="caption">{props.subtitle}</Text>
    </Pressable>
  );
}

/** 섹션 제목 (+ 오른쪽 보조 정보) */
export function SectionHeader({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <View className="flex-row items-end pt-8 pb-2">
      <Text variant="section" className="flex-1">
        {title}
      </Text>
      {trailing && <Text variant="caption">{trailing}</Text>}
    </View>
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

/** 사진이 생기기 전까지 쓰는 이니셜 아바타. 장식 없이 중립 회색. */
export function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  return (
    <View className="items-center justify-center rounded-full bg-grey-100" style={{ width: size, height: size }}>
      <Text className="font-bold text-grey-700" style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {[...name][0]}
      </Text>
    </View>
  );
}

// ───────────────────────── 목록 행 ─────────────────────────

/** 목록 행 공통: 아바타 + 가운데 내용 + 오른쪽(선택). 누르면 옅은 회색. */
export function ListRow(props: { name: string; children: ReactNode; right?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={props.onPress} className="flex-row items-center gap-4 py-3 active:bg-grey-50">
      <Avatar name={props.name} />
      <View className="flex-1 gap-0.5">{props.children}</View>
      {props.right}
    </Pressable>
  );
}

/** 사람 행: 이름 + 모국어 + 자기소개 한 줄 */
export function PersonRow({ person, onPress }: { person: User; onPress?: () => void }) {
  return (
    <ListRow name={person.nickname} onPress={onPress}>
      <Text variant="body" numberOfLines={1}>
        {person.nickname}
      </Text>
      <Text variant="caption">{langLabel[person.nativeLang]} 원어민</Text>
      {person.bio !== '' && (
        <Text variant="sub" className="mt-0.5" numberOfLines={1}>
          {person.bio}
        </Text>
      )}
    </ListRow>
  );
}

// ───────────────────────── 오늘의 표현 ─────────────────────────

/**
 * 오늘의 일본어 / 今日の韓国語 — Hana의 시그니처 블록. 화면에서 유일하게 색 면을 갖는다.
 * 내가 배우는 언어(모국어의 반대)를 크게, 발음과 뜻을 작게.
 * onDark: 통화 화면처럼 어두운 배경 위에 올릴 때
 */
export function TodayPhraseCard({ phrase, myLang, onDark }: { phrase: Phrase; myLang: Lang; onDark?: boolean }) {
  const learnJa = myLang === 'ko';
  const dim = onDark ? 'text-white/70' : 'text-grey-700';
  const accent = onDark ? 'text-white' : 'text-phrase';
  return (
    <View className={cn('rounded-xl p-6', onDark ? 'bg-white/10' : 'bg-phrase-soft')}>
      <Text variant="caption" className={dim}>
        <Text className={cn('font-bold text-caption', accent)}>{learnJa ? '오늘의 일본어' : '今日の韓国語'}</Text>
        {'  ·  '}
        {phrase.situation[myLang]}
      </Text>
      <Text variant="display" className={cn('mt-3', onDark && 'text-white')}>
        {learnJa ? phrase.ja : phrase.ko}
      </Text>
      <Text variant="sub" className={cn('mt-1 font-semibold', accent)}>
        {learnJa ? phrase.jaReading : phrase.koReading}
      </Text>
      <Text variant="sub" className={cn('mt-2', dim)}>
        {phrase[myLang]}
      </Text>
    </View>
  );
}

// ───────────────────────── 빈 화면 · 말풍선 ─────────────────────────

/** 빈 화면: 펭귄 + 제목 + 설명 + (선택) 버튼 하나 */
export function EmptyState({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <View className="items-center gap-2 py-20">
      <Mascot pose="idle" width={120} />
      <Text variant="section" className="mt-2 text-center">
        {title}
      </Text>
      <Text variant="sub" className="text-center">
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
          'max-w-[280px] shrink rounded-[18px] px-3.5 py-2.5',
          mine ? 'rounded-br-[4px] bg-primary' : 'rounded-bl-[4px] bg-grey-100',
        )}>
        <Text variant="sub" className={mine ? 'text-white' : 'text-foreground'}>
          {body}
        </Text>
      </View>
      {!mine && stamp}
    </View>
  );
}

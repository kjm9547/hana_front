import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import type { Lang, Phrase, User } from '@/lib/api';

import { LookingPenguin } from './looking';
import { colors, font, maxWidth, radius, space, text } from './theme';

export { Feather as Icon };

export const langLabel: Record<Lang, string> = { ko: '한국어', ja: '日本語' };

// ───────────────────────── 화면 틀 ─────────────────────────

/** 흰 바탕 + 안전 영역 + 최대 폭 가운데 정렬. 모든 화면의 바깥 틀. */
export function Screen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: Edge[] }) {
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      <View style={styles.column}>{children}</View>
    </SafeAreaView>
  );
}

/** 탭 공통 틀: 큰 제목 + 스크롤 본문 (+ 하단 고정 바) */
export function TabPage({ title, children, bottom }: { title: string; children: ReactNode; bottom?: ReactNode }) {
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.tabBody}>
        <Text style={[text.title, { marginBottom: space.xl }]}>{title}</Text>
        {children}
      </ScrollView>
      {bottom && <View style={styles.bottomBar}>{bottom}</View>}
    </Screen>
  );
}

export const Spinner = () => <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />;

export const Divider = ({ indent = 0 }: { indent?: number }) => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.grey200, marginLeft: indent }} />
);

/** 목록 행 사이 구분선 (아바타 52 + 간격 16만큼 들여쓰기) */
export const RowDivider = () => <Divider indent={68} />;

// ───────────────────────── 기본 컨트롤 ─────────────────────────

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** lg: 화면 하단 CTA · md: 본문 안 버튼 · sm: 작은 보조 버튼 */
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', size = 'lg', disabled, style }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { height: buttonHeights[size], paddingHorizontal: size === 'sm' ? space.md : space.lg },
        v.box,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 },
        style,
      ]}>
      <Text style={[size === 'lg' ? styles.buttonTextLg : styles.buttonText, v.text]}>{title}</Text>
    </Pressable>
  );
}

const buttonHeights = { lg: 56, md: 44, sm: 32 };
const buttonVariants = {
  primary: { box: { backgroundColor: colors.primary }, text: { color: colors.white } },
  secondary: { box: { backgroundColor: colors.grey100 }, text: { color: colors.grey900 } },
  outline: { box: { borderWidth: 1, borderColor: colors.grey200 }, text: { color: colors.grey900 } },
  ghost: { box: {}, text: { color: colors.grey500, fontFamily: font.medium } },
};

/** 입력칸: 회색 테두리, 포커스되면 포인트 컬러 */
export function Input({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.grey500}
      {...props}
      onFocus={(e) => (setFocused(true), onFocus?.(e))}
      onBlur={(e) => (setFocused(false), onBlur?.(e))}
      style={[styles.input, focused && { borderColor: colors.primary }, style]}
    />
  );
}

/** 선택 카드: 선택되면 포인트 테두리 + 옅은 포인트 면 */
export function ChoiceCard(props: { title: string; subtitle: string; selected: boolean; onPress: () => void }) {
  const { selected } = props;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={props.onPress}
      style={[
        styles.choice,
        selected && { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1.5 },
      ]}>
      <Text style={text.body}>{props.title}</Text>
      <Text style={text.caption}>{props.subtitle}</Text>
    </Pressable>
  );
}

/** 섹션 제목 (+ 오른쪽 보조 정보) */
export function SectionHeader({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[text.section, { flex: 1 }]}>{title}</Text>
      {trailing && <Text style={text.caption}>{trailing}</Text>}
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
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[text.body, { fontFamily: font.bold, color: colors.grey700, fontSize: size * 0.38, lineHeight: size * 0.5 }]}>
        {[...name][0]}
      </Text>
    </View>
  );
}

// ───────────────────────── 목록 행 ─────────────────────────

/** 목록 행 공통: 아바타 + 가운데 내용 + 오른쪽(선택). 누르면 옅은 회색. */
export function ListRow(props: { name: string; children: ReactNode; right?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.grey50 }]}>
      <Avatar name={props.name} />
      <View style={{ flex: 1, gap: 2 }}>{props.children}</View>
      {props.right}
    </Pressable>
  );
}

/** 사람 행: 이름 + 모국어 + 자기소개 한 줄 */
export function PersonRow({ person, onPress }: { person: User; onPress?: () => void }) {
  return (
    <ListRow name={person.nickname} onPress={onPress}>
      <Text style={text.body} numberOfLines={1}>
        {person.nickname}
      </Text>
      <Text style={text.caption}>{langLabel[person.nativeLang]} 원어민</Text>
      {person.bio !== '' && (
        <Text style={[text.sub, { marginTop: 2 }]} numberOfLines={1}>
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
  const fg = onDark ? colors.white : colors.grey900;
  const dim = onDark ? 'rgba(255,255,255,0.7)' : colors.grey700;
  const accent = onDark ? colors.white : colors.accent;
  return (
    <View style={[styles.phrase, { backgroundColor: onDark ? 'rgba(255,255,255,0.1)' : colors.accentSoft }]}>
      <Text style={[text.caption, { color: dim }]}>
        <Text style={{ color: accent, fontFamily: font.bold }}>{learnJa ? '오늘의 일본어' : '今日の韓国語'}</Text>
        {'  ·  '}
        {phrase.situation[myLang]}
      </Text>
      <Text style={[text.display, { color: fg, marginTop: space.md }]}>{learnJa ? phrase.ja : phrase.ko}</Text>
      <Text style={[text.sub, { color: accent, fontFamily: font.semibold, marginTop: space.xs }]}>
        {learnJa ? phrase.jaReading : phrase.koReading}
      </Text>
      <Text style={[text.sub, { color: dim, marginTop: space.sm }]}>{phrase[myLang]}</Text>
    </View>
  );
}

// ───────────────────────── 빈 화면 · 말풍선 ─────────────────────────

/** 빈 화면: 펭귄 + 제목 + 설명 + (선택) 버튼 하나 */
export function EmptyState({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Mascot pose="idle" width={120} />
      <Text style={[text.section, styles.center, { marginTop: space.sm }]}>{title}</Text>
      <Text style={[text.sub, styles.center]}>{subtitle}</Text>
      {action && <View style={{ marginTop: space.lg }}>{action}</View>}
    </View>
  );
}

/**
 * 채팅 말풍선: 내 메시지는 오른쪽 포인트 컬러, 상대는 왼쪽 회색.
 * time은 말풍선 옆 아래에 작게 (내 말은 왼쪽, 상대 말은 오른쪽).
 */
export function ChatBubble({ body, mine, time }: { body: string; mine: boolean; time?: string }) {
  const stamp = time && <Text style={[text.caption, { fontSize: 11, lineHeight: 14 }]}>{time}</Text>;
  return (
    <View style={[styles.bubbleRow, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
      {mine && stamp}
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: colors.grey100, borderBottomLeftRadius: 4 },
        ]}>
        <Text style={[text.sub, { color: mine ? colors.white : colors.grey900 }]}>{body}</Text>
      </View>
      {!mine && stamp}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  column: { flex: 1, width: '100%', maxWidth, alignSelf: 'center' },
  tabBody: { paddingHorizontal: space.page, paddingTop: space.lg, paddingBottom: space.xxl },
  bottomBar: {
    paddingHorizontal: space.page,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grey200,
  },
  button: { borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: font.semibold, fontSize: 14 },
  buttonTextLg: { fontFamily: font.semibold, fontSize: 17 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: radius,
    paddingHorizontal: space.lg,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.grey900,
    outlineWidth: 0, // 웹 브라우저 기본 포커스 테두리 제거 (테두리 색으로 대신 표시)
  },
  choice: { flex: 1, padding: space.lg, borderRadius: radius, borderWidth: 1, borderColor: colors.grey200, gap: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: space.xxl, paddingBottom: space.sm },
  avatar: { backgroundColor: colors.grey100, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.md },
  phrase: { padding: space.xl, borderRadius: 20 },
  empty: { paddingVertical: 80, alignItems: 'center', gap: space.sm },
  center: { textAlign: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs },
  bubble: { maxWidth: 280, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, flexShrink: 1 },
});

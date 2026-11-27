// 상대 경로: vitest가 '@/' 별칭을 모른다
import { t } from '../i18n';

const DAY = 86_400_000;

// 날짜 모양은 언어 사전(t.time)에서 고른다. Intl은 실행 환경(Hermes·브라우저·Node)마다 결과가 달라서 쓰지 않는다.

/** 달력상 며칠 전인지 (시각 무시, 서머타임에도 안전하게 UTC 자정끼리 비교) */
export const daysAgo = (d: Date, now: Date) => dayIndex(now) - dayIndex(d);
const dayIndex = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;

/** "오후 3:42" · "15:42" */
export const clockLabel = (d: Date) => t.time.clock(d.getHours(), String(d.getMinutes()).padStart(2, '0'));

/** 채팅방 날짜 구분선: 오늘 · 어제 · 11월 23일 (월) · 2025년 11월 23일 (일) */
export function dayLabel(d: Date, now: Date) {
  const ago = daysAgo(d, now);
  if (ago === 0) return t.time.today;
  if (ago === 1) return t.time.yesterday;
  const md = t.time.withWeekday(t.time.monthDay(d.getMonth() + 1, d.getDate()), t.time.weekdays[d.getDay()]);
  return d.getFullYear() === now.getFullYear() ? md : t.time.withYear(d.getFullYear(), md);
}

/** 대화 목록용: 오늘은 시계, 어제는 "어제", 올해는 "11월 23일", 그 전은 "2025. 11. 23." */
export function chatTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  if (ago === 0) return clockLabel(d);
  if (ago === 1) return t.time.yesterday;
  return d.getFullYear() === now.getFullYear()
    ? t.time.monthDay(d.getMonth() + 1, d.getDate())
    : t.time.shortDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** 게시판용: "방금" · "12분 전" · "3시간 전" · "어제" · 그 전은 대화 목록과 같은 날짜 */
export function agoLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const minutes = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (minutes < 1) return t.time.justNow;
  if (minutes < 60) return t.time.minutesAgo(minutes);
  if (minutes < 24 * 60 && daysAgo(d, now) === 0) return t.time.hoursAgo(Math.floor(minutes / 60));
  return chatTime(iso, now);
}

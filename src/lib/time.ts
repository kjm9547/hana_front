const DAY = 86_400_000;

/** 달력상 며칠 전인지 (시각 무시, 서머타임에도 안전하게 UTC 자정끼리 비교) */
export const daysAgo = (t: Date, now: Date) => dayIndex(now) - dayIndex(t);
const dayIndex = (t: Date) => Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY;

/** "오후 3:42" */
export function clockLabel(t: Date) {
  const h = t.getHours() % 12 || 12;
  return `${t.getHours() < 12 ? '오전' : '오후'} ${h}:${String(t.getMinutes()).padStart(2, '0')}`;
}

/** 채팅방 날짜 구분선: 오늘 · 어제 · 11월 23일 (월) · 2025년 11월 23일 (일) */
export function dayLabel(t: Date, now: Date) {
  const ago = daysAgo(t, now);
  if (ago === 0) return '오늘';
  if (ago === 1) return '어제';
  const md = `${t.getMonth() + 1}월 ${t.getDate()}일 (${'일월화수목금토'[t.getDay()]})`;
  return t.getFullYear() === now.getFullYear() ? md : `${t.getFullYear()}년 ${md}`;
}

/** 대화 목록용: 오늘은 "오후 3:42", 어제는 "어제", 올해는 "11월 23일", 그 전은 "2025. 11. 23." */
export function chatTime(iso: string, now = new Date()) {
  const t = new Date(iso);
  const ago = daysAgo(t, now);
  if (ago === 0) return clockLabel(t);
  if (ago === 1) return '어제';
  return t.getFullYear() === now.getFullYear()
    ? `${t.getMonth() + 1}월 ${t.getDate()}일`
    : `${t.getFullYear()}. ${t.getMonth() + 1}. ${t.getDate()}.`;
}

/** 게시판용: "방금" · "12분 전" · "3시간 전" · "어제" · 그 전은 대화 목록과 같은 날짜 */
export function agoLabel(iso: string, now = new Date()) {
  const t = new Date(iso);
  const minutes = Math.floor((now.getTime() - t.getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 24 * 60 && daysAgo(t, now) === 0) return `${Math.floor(minutes / 60)}시간 전`;
  return chatTime(iso, now);
}

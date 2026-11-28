import { describe, expect, test } from 'vitest';

import { chatTime, clockLabel, dayLabel } from './time';

// 월은 0부터: new Date(2026, 10, 25) = 2026-11-25
const now = new Date(2026, 10, 25, 0, 30); // 수요일 자정 직후

describe('채팅 시간 표시', () => {
  test('시계: 오전/오후 12시 경계', () => {
    expect(clockLabel(new Date(2026, 0, 1, 0, 5))).toBe('오전 12:05');
    expect(clockLabel(new Date(2026, 0, 1, 12, 0))).toBe('오후 12:00');
    expect(clockLabel(new Date(2026, 0, 1, 15, 42))).toBe('오후 3:42');
  });

  test('날짜 구분선: 시각이 아니라 달력 날짜로 오늘/어제를 가른다', () => {
    expect(dayLabel(new Date(2026, 10, 25, 0, 1), now)).toBe('오늘');
    expect(dayLabel(new Date(2026, 10, 24, 23, 59), now)).toBe('어제'); // 31분 전이어도 어제
    expect(dayLabel(new Date(2026, 10, 23, 12), now)).toBe('11월 23일 (월)');
    expect(dayLabel(new Date(2025, 11, 31, 12), now)).toBe('2025년 12월 31일 (수)');
  });

  test('대화 목록 시간', () => {
    const at = (t: Date) => chatTime(t.toISOString(), now);
    expect(at(new Date(2026, 10, 25, 0, 10))).toBe('오전 12:10');
    expect(at(new Date(2026, 10, 24, 9))).toBe('어제');
    expect(at(new Date(2026, 2, 1))).toBe('3월 1일');
    expect(at(new Date(2025, 2, 1))).toBe('2025. 3. 1.');
  });
});

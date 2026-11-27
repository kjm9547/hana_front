import { describe, expect, test, vi } from 'vitest';

/** 기기 언어를 정해 놓고 time.ts를 새로 불러온다 (화면 언어는 모듈을 불러올 때 정해진다) */
async function load(languageCode: string) {
  vi.resetModules();
  vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode }] }));
  return import('./time');
}

const { agoLabel, chatTime, clockLabel, dayLabel } = await load('ko');

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
    const at = (d: Date) => chatTime(d.toISOString(), now);
    expect(at(new Date(2026, 10, 25, 0, 10))).toBe('오전 12:10');
    expect(at(new Date(2026, 10, 24, 9))).toBe('어제');
    expect(at(new Date(2026, 2, 1))).toBe('3월 1일');
    expect(at(new Date(2025, 2, 1))).toBe('2025. 3. 1.');
  });
});

describe('게시판 시간 표시', () => {
  const later = new Date(2026, 10, 25, 15, 0);
  const at = (d: Date) => agoLabel(d.toISOString(), later);
  test('1분 안은 방금, 1시간 안은 분, 오늘 안은 시간', () => {
    expect(at(new Date(2026, 10, 25, 14, 59, 30))).toBe('방금');
    expect(at(new Date(2026, 10, 25, 14, 48))).toBe('12분 전');
    expect(at(new Date(2026, 10, 25, 12, 0))).toBe('3시간 전');
  });
  test('달력이 넘어가면 시간 대신 어제 · 날짜', () => {
    expect(agoLabel(new Date(2026, 10, 24, 23, 0).toISOString(), now)).toBe('어제'); // 1시간 30분 전이어도 어제
    expect(at(new Date(2026, 10, 20, 9))).toBe('11월 20일');
  });
});

test('일본어: 24시간 시계, 붙여 쓰는 날짜', async () => {
  const ja = await load('ja');
  expect(ja.clockLabel(new Date(2026, 0, 1, 15, 42))).toBe('15:42');
  expect(ja.clockLabel(new Date(2026, 0, 1, 0, 5))).toBe('0:05');
  expect(ja.dayLabel(new Date(2026, 10, 23, 12), now)).toBe('11月23日(月)');
  expect(ja.dayLabel(new Date(2025, 11, 31, 12), now)).toBe('2025年12月31日(水)');
  expect(ja.chatTime(new Date(2025, 2, 1).toISOString(), now)).toBe('2025/3/1');
  expect(ja.agoLabel(new Date(2026, 10, 25, 0, 18).toISOString(), now)).toBe('12分前');
});

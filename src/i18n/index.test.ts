import { expect, test, vi } from 'vitest';

/** 기기 언어 목록을 정해 놓고 i18n을 새로 불러온다 */
async function load(...codes: (string | null)[]) {
  vi.resetModules();
  vi.doMock('expo-localization', () => ({ getLocales: () => codes.map((languageCode) => ({ languageCode })) }));
  return import('./index');
}

test('기기 언어가 한국어·일본어면 그 언어', async () => {
  expect((await load('ja')).lang).toBe('ja');
  expect((await load('ko')).deviceLang).toBe('ko');
});

test('목록에서 처음 나오는 한국어·일본어를 고른다 (영어 다음 일본어 → 일본어)', async () => {
  const { lang, deviceLang } = await load('en', 'ja', 'ko');
  expect([lang, deviceLang]).toEqual(['ja', 'ja']);
});

test('한국어·일본어가 없으면 화면은 한국어, 사용자 언어는 가입 때 직접 고른다(null)', async () => {
  const { lang, deviceLang, t } = await load('en', null);
  expect([lang, deviceLang]).toEqual(['ko', null]);
  expect(t.signup.next).toBe('다음');
});

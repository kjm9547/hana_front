import { getLocales } from 'expo-localization';

import type { Lang } from '@/lib/api';

import { ja } from './ja';
import { ko } from './ko';

/**
 * 기기 언어 설정에서 처음 나오는 한국어·일본어. 둘 다 없으면 null.
 * 가입할 때 사용자의 언어(nativeLang)로 쓰고, null이면 가입 퍼널에서 직접 고르게 한다.
 */
export const deviceLang: Lang | null =
  getLocales()
    .map((l) => l.languageCode)
    .find((c): c is Lang => c === 'ko' || c === 'ja') ?? null;

/** 화면 언어: 기기 언어를 따르고, 한국어·일본어가 아니면 한국어 */
export const lang: Lang = deviceLang ?? 'ko';

// ponytail: 앱이 켜질 때 한 번 정하는 상수. 앱 안에서 언어를 바꾸는 설정을 넣을 때 useT() 훅으로 바꾼다.
/** 화면 문구. 사용: t.signup.next, t.time.minutesAgo(3) */
export const t = lang === 'ja' ? ja : ko;

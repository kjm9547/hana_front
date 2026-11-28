import Constants from 'expo-constants';

// 서버 응답 타입. 원본은 hana_server의 users/chat repository — 서버가 바뀌면 여기도 맞춘다.
export type Lang = 'ko' | 'ja';
export type User = { id: number; nickname: string; nativeLang: Lang; bio: string };
export type Me = User & { email: string };
export type Phrase = { ko: string; ja: string; koReading: string; jaReading: string; situation: Record<Lang, string> };
export type Message = { id: number; conversationId: number; senderId: number; body: string; createdAt: string };
export type Conversation = { id: number; partner: User; lastMessage: Message | null };
export type Page<T> = { items: T[]; nextCursor: number | null };

// EXPO_PUBLIC_API_BASE가 없으면 Expo 개발 서버가 떠 있는 PC의 3000번 포트.
// 그래서 웹·에뮬레이터·같은 Wi-Fi의 휴대폰 모두 설정 없이 붙는다.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? `http://${devHost ?? 'localhost'}:3000`;

// ponytail: 토큰은 메모리에만 → 새로고침하면 다시 로그인. 자동 로그인이 필요해지면 expo-secure-store로.
let token: string | null = null;
export const getToken = () => token;
export const setToken = (t: string | null) => {
  token = t;
};

export async function api<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? text;
    throw new Error(Array.isArray(msg) ? msg.join('\n') : String(msg));
  }
  return data;
}

import Constants from 'expo-constants';

// 서버 응답 타입. 원본은 hana_server의 users/chat/board repository — 서버가 바뀌면 여기도 맞춘다.
export type Lang = 'ko' | 'ja';
export type User = { id: number; nickname: string; nativeLang: Lang; bio: string };
export type Me = User & { email: string };
export type Message = { id: number; conversationId: number; senderId: number; body: string; createdAt: string };
export type Conversation = { id: number; partner: User; lastMessage: Message | null };
export type Page<T> = { items: T[]; nextCursor: number | null };
export type Post = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  author: User;
  /** 사진 주소(로컬은 '/images/…', S3는 'https://…'). 화면에서는 assetUrl()로 감싼다 */
  images: string[];
  commentCount: number;
  likeCount: number;
};
export type PostComment = { id: number; body: string; createdAt: string; author: User };
export type PostDetail = Post & { likedByMe: boolean; comments: PostComment[] };

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
  return parse<T>(res);
}

/** 서버가 준 사진 주소를 실제 주소로. 로컬 저장소는 '/images/…' 경로, S3로 바꾸면 'https://…'를 그대로 쓴다 */
export const assetUrl = (url: string) => (/^https?:\/\//.test(url) ? url : API_BASE + url);

/** 사진 한 장 올리기 (multipart file 필드). 웹은 File을 그대로, 앱은 { uri, name, type }으로 보낸다. */
export async function uploadImage(asset: { uri: string; mimeType?: string; fileName?: string | null; file?: File }) {
  const form = new FormData();
  if (asset.file) form.append('file', asset.file);
  else {
    const photo = { uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' };
    form.append('file', photo as unknown as Blob); // React Native의 FormData는 이 모양을 파일로 보낸다
  }
  const res = await fetch(API_BASE + '/images', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  return parse<{ id: number; url: string }>(res);
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? text;
    throw new Error(Array.isArray(msg) ? msg.join('\n') : String(msg));
  }
  return data;
}

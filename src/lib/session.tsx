import { createContext, type ReactNode, use, useCallback, useEffect, useState } from 'react';

import { api, type Me, setToken } from './api';
import { connectChat, disconnectChat } from './chat';
import { showError } from './toast';

type Session = {
  me: Me | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  reloadMe: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

/** 로그인 상태. me가 있으면 로그인된 것 — 루트 레이아웃이 이걸로 화면을 가른다. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);

  const reloadMe = async () => setMe(await api<Me>('GET', '/me'));
  const signIn = async (token: string) => {
    setToken(token);
    await reloadMe();
    connectChat(token);
  };
  const signOut = () => {
    setToken(null);
    disconnectChat();
    setMe(null);
  };

  return <SessionContext value={{ me, signIn, signOut, reloadMe }}>{children}</SessionContext>;
}

export const useSession = () => use(SessionContext)!;

/** 로그인 뒤 화면에서만 쓴다 (루트 레이아웃이 보장) */
export const useMe = () => useSession().me!;

/** GET 한 번 + 다시 불러오기. 실패하면 토스트. */
export function useApi<T>(path: string) {
  const [data, setData] = useState<T>();
  const reload = useCallback(() => api<T>('GET', path).then(setData, showError), [path]);
  useEffect(() => {
    reload();
  }, [reload]);
  return [data, reload] as const;
}

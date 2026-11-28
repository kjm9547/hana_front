import { router } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';
import { io, type Socket } from 'socket.io-client';

import { API_BASE, type Conversation, type Message } from './api';

/** 채팅방으로 이동. 상대 정보는 헤더에 바로 그리려고 같이 넘긴다. */
export const openChatRoom = ({ id, partner }: Pick<Conversation, 'id' | 'partner'>) =>
  router.push({
    pathname: '/chat/[id]',
    params: { id, nickname: partner.nickname, nativeLang: partner.nativeLang },
  });

/**
 * 받기 전용 실시간 채널. 보내기는 REST(POST /conversations/:id/messages)로 한다.
 * 로그인하면 connectChat, 로그아웃하면 disconnectChat (session.tsx).
 */
type Listener = { onMessage: (m: Message) => void; onReconnect: () => void };
const listeners = new Set<Listener>();
let socket: Socket | null = null;

export function connectChat(token: string) {
  disconnectChat();
  let first = true;
  // forceNew: 로그아웃 후 다른 계정으로 로그인해도 예전 토큰의 연결을 재사용하지 않게
  socket = io(API_BASE, { transports: ['websocket'], auth: { token }, forceNew: true });
  socket.on('connect', () => {
    // 끊겼다 다시 붙은 순간. 그 사이 놓친 메시지는 각 화면이 REST로 다시 불러온다.
    if (!first) listeners.forEach((l) => l.onReconnect());
    first = false;
  });
  socket.on('message:new', (data: { message: Message }) => listeners.forEach((l) => l.onMessage(data.message)));
}

export function disconnectChat() {
  socket?.disconnect();
  socket = null;
}

/** 화면이 떠 있는 동안 새 메시지·재연결을 받는다 */
export function useChatEvents(onMessage: (m: Message) => void, onReconnect: () => void) {
  const message = useEffectEvent(onMessage);
  const reconnect = useEffectEvent(onReconnect);
  useEffect(() => {
    const l: Listener = { onMessage: (m) => message(m), onReconnect: () => reconnect() };
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
}

// src/hooks/useSocket.ts
import { useEffect } from 'react';
import { socket } from '../socket/socket';

export const useSocket = (code: string) => {
  useEffect(() => {
    if (!code) return;

    if (!socket.connected) {
      socket.connect();
    }

    console.log('📡 WebSocket 연결:', socket.id);
    socket.emit('join_room', { code });

    return () => {
      socket.emit('leave_room', { code });
      socket.off(); // 모든 이벤트 리스너 제거
    };
  }, [code]);

  return socket;
};

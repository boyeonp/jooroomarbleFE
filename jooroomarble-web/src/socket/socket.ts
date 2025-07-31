import { io, Socket } from 'socket.io-client';

export const socket: Socket = io('https://api.jooroomarble.store/ws/session', {
  transports: ['websocket'],
  autoConnect: false, // ✨ 수동 연결
});
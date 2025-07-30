import { io, Socket } from 'socket.io-client';

export const socket: Socket = io('http://34.64.111.205/ws/session', {
  transports: ['websocket'],
  autoConnect: false, // ✨ 수동 연결
});
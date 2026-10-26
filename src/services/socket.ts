import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = getStoredToken();
    const serverUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '/');
    socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      auth: {
        token: token || '',
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // connected
    });

    socket.on('connect_error', (error) => {
      // socket error
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  const token = getStoredToken();
  if (s.auth && typeof s.auth === 'object') {
    (s.auth as any).token = token || '';
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

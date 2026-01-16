import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    socket = io(url, {
      autoConnect: false,
      reconnection: true,
      transports: ['websocket'],
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();
  if (!s.connected) {
    // Get token from storage
    const token = localStorage.getItem('token');

    // Update socket options with token
    s.auth = { token };
    s.io.opts.query = { userId };

    s.connect();
    console.log('🔌 Socket connecting with token...');
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('❌ Socket disconnected');
  }
};

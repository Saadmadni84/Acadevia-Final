import { io, type Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback as never);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket?.off(event, callback as never);
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();

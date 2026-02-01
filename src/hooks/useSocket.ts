import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  channel: 'main' | 'sub';
  expression?: string;
  color?: string;
}

interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

export interface User {
  name: string;
  color: string;
}

interface RoomState {
  messages: Message[];
  tokens: Token[];
  users: User[];
}

interface UseSocketOptions {
  serverUrl?: string;
  roomId?: string;
  user: {
    name: string;
    color: string;
  };
}

export function useSocket({ serverUrl, roomId = 'default', user }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const url = serverUrl || import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
      socket.emit('join-room', { roomId, user: userRef.current });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(`接続エラー: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('room-state', (state: RoomState) => {
      setMessages(state.messages);
      setTokens(state.tokens);
      setUsers(state.users);
    });

    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('token-moved', ({ tokenId, x, y }) => {
      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, x, y } : t
      ));
    });

    socket.on('token-added', (token: Token) => {
      setTokens(prev => [...prev, token]);
    });

    socket.on('user-joined', ({ users: newUsers }) => {
      setUsers(newUsers);
    });

    socket.on('user-left', ({ users: newUsers }) => {
      setUsers(newUsers);
    });

    return () => {
      socket.disconnect();
    };
  }, [url, roomId]);

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat-message', message);
    }
  }, []);

  const moveToken = useCallback((tokenId: string, x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('token-move', { tokenId, x, y });
      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, x, y } : t
      ));
    }
  }, []);

  const addToken = useCallback((token: Omit<Token, 'id'>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('token-add', token);
    }
  }, []);

  return {
    isConnected,
    error,
    messages,
    tokens,
    users,
    sendMessage,
    moveToken,
    addToken,
  };
}

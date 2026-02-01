import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://tany0131.github.io'
    ],
    methods: ['GET', 'POST']
  }
});

// ルームごとの状態を保持
const rooms = new Map();

// デフォルトのルーム状態
function createDefaultRoomState() {
  return {
    messages: [
      {
        id: 'system-1',
        sender: 'System',
        text: 'セッション開始！',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'main',
        color: '#888'
      }
    ],
    tokens: [
      { id: 'token-1', name: 'Hero', x: 200, y: 200, color: '#3b82f6' },
      { id: 'token-2', name: 'Orc', x: 280, y: 200, color: '#ef4444' }
    ],
    users: new Map()
  };
}

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);

  let currentRoom = null;
  let userName = null;

  // ルームに参加
  socket.on('join-room', ({ roomId, user }) => {
    currentRoom = roomId || 'default';
    userName = user?.name || 'Anonymous';

    socket.join(currentRoom);

    // ルームが存在しなければ作成
    if (!rooms.has(currentRoom)) {
      rooms.set(currentRoom, createDefaultRoomState());
    }

    const roomState = rooms.get(currentRoom);
    roomState.users.set(socket.id, { name: userName, color: user?.color || '#3b82f6' });

    console.log(`[${currentRoom}] ${userName} joined (${roomState.users.size} users)`);

    // 現在の状態を送信
    socket.emit('room-state', {
      messages: roomState.messages,
      tokens: roomState.tokens,
      users: Array.from(roomState.users.values())
    });

    // 他のユーザーに通知
    socket.to(currentRoom).emit('user-joined', {
      name: userName,
      users: Array.from(roomState.users.values())
    });
  });

  // チャットメッセージ
  socket.on('chat-message', (message) => {
    if (!currentRoom) return;

    const roomState = rooms.get(currentRoom);
    if (!roomState) return;

    const newMessage = {
      ...message,
      id: `msg-${Date.now()}-${socket.id.slice(0, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    roomState.messages.push(newMessage);

    // 全員に配信
    io.to(currentRoom).emit('chat-message', newMessage);

    console.log(`[${currentRoom}] ${message.sender}: ${message.text.slice(0, 30)}...`);
  });

  // トークン移動
  socket.on('token-move', ({ tokenId, x, y }) => {
    if (!currentRoom) return;

    const roomState = rooms.get(currentRoom);
    if (!roomState) return;

    const token = roomState.tokens.find(t => t.id === tokenId);
    if (token) {
      token.x = x;
      token.y = y;

      // 他のユーザーに通知
      socket.to(currentRoom).emit('token-moved', { tokenId, x, y });
    }
  });

  // トークン追加
  socket.on('token-add', (token) => {
    if (!currentRoom) return;

    const roomState = rooms.get(currentRoom);
    if (!roomState) return;

    const newToken = {
      ...token,
      id: `token-${Date.now()}`
    };

    roomState.tokens.push(newToken);
    io.to(currentRoom).emit('token-added', newToken);
  });

  // 切断
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);

    if (currentRoom && rooms.has(currentRoom)) {
      const roomState = rooms.get(currentRoom);
      roomState.users.delete(socket.id);

      socket.to(currentRoom).emit('user-left', {
        name: userName,
        users: Array.from(roomState.users.values())
      });

      // ルームが空になったら削除（オプション）
      if (roomState.users.size === 0) {
        // rooms.delete(currentRoom); // コメントアウト: 状態を保持したい場合
        console.log(`[${currentRoom}] Room is now empty`);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`
🎲 TRPG VTT Server running on port ${PORT}

   WebSocket: ws://localhost:${PORT}

   Ready to accept connections!
  `);
});

import { useState, useMemo } from 'react';
import { GameLayout } from './components/Layout/GameLayout';
import { Sidebar } from './components/Layout/Sidebar';
import { MapCanvas } from './components/Map/MapCanvas';
import { DiceRoller } from './components/System/DiceRoller';
import { SplitChatPanel } from './components/System/SplitChatPanel';
import { MessageBubble } from './components/System/MessageBubble';
import { MainLogPanel } from './components/System/MainLogPanel';
import { ConnectionStatus } from './components/System/ConnectionStatus';
import { useSocket } from './hooks/useSocket';

interface ActiveMessage {
  sender: string;
  text: string;
  expression?: string;
  color: string;
}

function App() {
  const [activeMessage, setActiveMessage] = useState<ActiveMessage | null>(null);
  const [activeSpeaker] = useState({ name: '探索者A', color: '#3b82f6' });

  // WebSocket接続
  const {
    isConnected,
    error,
    messages,
    tokens,
    users,
    sendMessage,
    moveToken,
  } = useSocket({
    roomId: 'default',
    user: activeSpeaker,
  });

  // メインログ用のメッセージ（mainチャンネルのみ）
  const mainLogMessages = useMemo(() =>
    messages
      .filter(m => m.channel === 'main')
      .map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        color: m.color,
      })),
    [messages]
  );

  const handleNewMessage = (message: { sender: string; text: string; expression?: string; color: string; channel: 'main' | 'sub' }) => {
    // サーバーに送信
    sendMessage({
      sender: message.sender,
      text: message.text,
      channel: message.channel,
      expression: message.expression,
      color: message.color,
    });

    // 本編チャンネルの場合のみ発言バブルを表示
    if (message.channel === 'main') {
      setActiveMessage({
        sender: message.sender,
        text: message.text,
        color: message.color,
        expression: message.expression,
      });
    }
  };

  const handleMessageComplete = () => {
    setActiveMessage(null);
  };

  return (
    <GameLayout
      sidebar={<Sidebar users={users} />}
      overlay={
        <>
          <DiceRoller />

          {/* 接続状態表示 */}
          <ConnectionStatus isConnected={isConnected} error={error} />

          {/* 本編ログ（画面中央・ドラッグ/リサイズ可能） */}
          <MainLogPanel messages={mainLogMessages} />

          {/* 雑談パネル + 入力（画面右下） */}
          <SplitChatPanel
            messages={messages}
            onNewMessage={handleNewMessage}
            activeSpeaker={activeSpeaker}
          />

          {/* 発言バブル */}
          {activeMessage && (
            <MessageBubble
              sender={activeMessage.sender}
              text={activeMessage.text}
              color={activeMessage.color}
              expression={activeMessage.expression}
              onComplete={handleMessageComplete}
            />
          )}
        </>
      }
    >
      <MapCanvas tokens={tokens} onTokenMove={moveToken} />
    </GameLayout>
  )
}

export default App

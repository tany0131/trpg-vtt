import { useState } from 'react';
import { GameLayout } from './components/Layout/GameLayout';
import { Sidebar } from './components/Layout/Sidebar';
import { MapCanvas } from './components/Map/MapCanvas';
import { DiceRoller } from './components/System/DiceRoller';
import { SplitChatPanel } from './components/System/SplitChatPanel';
import { MessageBubble } from './components/System/MessageBubble';
import { MainLogPanel } from './components/System/MainLogPanel';

interface ActiveMessage {
  sender: string;
  text: string;
  expression?: string;
  color: string;
}

interface LogMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  color?: string;
}

function App() {
  const [activeMessage, setActiveMessage] = useState<ActiveMessage | null>(null);
  const [activeSpeaker] = useState({ name: '探索者A', color: '#3b82f6' });
  const [mainLogMessages, setMainLogMessages] = useState<LogMessage[]>([
    { id: '1', sender: 'System', text: 'セッション開始！', timestamp: '12:00', color: '#888' },
  ]);

  const handleNewMessage = (message: ActiveMessage) => {
    // 発言バブルを表示
    setActiveMessage(message);
    
    // 本編ログに追加
    const logMessage: LogMessage = {
      id: Date.now().toString(),
      sender: message.sender,
      text: message.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: message.color,
    };
    setMainLogMessages(prev => [...prev, logMessage]);
  };

  const handleMessageComplete = () => {
    setActiveMessage(null);
  };

  return (
    <GameLayout
      sidebar={<Sidebar />}
      overlay={
        <>
          <DiceRoller />
          
          {/* 本編ログ（画面中央・ドラッグ/リサイズ可能） */}
          <MainLogPanel messages={mainLogMessages} />
          
          {/* 雑談パネル + 入力（画面右下） */}
          <SplitChatPanel 
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
      <MapCanvas />
    </GameLayout>
  )
}

export default App




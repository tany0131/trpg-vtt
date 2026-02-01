import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Coffee } from 'lucide-react';
import styles from './SplitChatPanel.module.css';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  channel: 'main' | 'sub';
  expression?: string;
  color?: string;
}

interface SplitChatPanelProps {
  messages?: Message[];
  onDiceResult?: (result: { value: number; type: string }) => void;
  onNewMessage?: (message: { sender: string; text: string; expression?: string; color: string; channel: 'main' | 'sub' }) => void;
  activeSpeaker?: { name: string; color: string };
}

export function SplitChatPanel({ messages = [], onDiceResult, onNewMessage, activeSpeaker }: SplitChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState<'main' | 'sub'>('main');

  const mainEndRef = useRef<HTMLDivElement>(null);
  const subEndRef = useRef<HTMLDivElement>(null);

  const mainMessages = messages.filter(m => m.channel === 'main');
  const subMessages = messages.filter(m => m.channel === 'sub');

  useEffect(() => {
    mainEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    subEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const expressionMatch = inputValue.match(/@(通常|笑顔|驚き|悲しみ|怒り|困惑)/);
    const expression = expressionMatch ? expressionMatch[1] : undefined;
    let text = inputValue.replace(/@(通常|笑顔|驚き|悲しみ|怒り|困惑)/g, '').trim();

    const diceMatch = text.match(/(\d+)d(\d+)/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1]);
      const sides = parseInt(diceMatch[2]);
      let total = 0;
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }
      text = `🎲 ${diceMatch[0]} → [${rolls.join(', ')}] = ${total}`;
      onDiceResult?.({ value: total, type: `${count}d${sides}` });
    }

    const sender = activeSpeaker?.name || 'You';
    const color = activeSpeaker?.color || '#c4a052';
    setInputValue('');
    onNewMessage?.({ sender, text, expression, color, channel: activeChannel });
  };

  return (
    <div className={styles.container}>
      <div className={styles.logSection}>
        <div className={styles.logHeader}>
          <MessageSquare size={14} />
          <span>本編ログ</span>
        </div>
        <div className={styles.messagesArea}>
          {mainMessages.map((msg) => (
            <div key={msg.id} className={styles.messageRow}>
              <span className={styles.sender} style={{ color: msg.color }}>{msg.sender}</span>
              <span className={styles.text}>{msg.text}</span>
            </div>
          ))}
          <div ref={mainEndRef} />
        </div>
      </div>

      <div className={styles.logSection}>
        <div className={styles.logHeader}>
          <Coffee size={14} />
          <span>雑談</span>
        </div>
        <div className={styles.messagesArea}>
          {subMessages.map((msg) => (
            <div key={msg.id} className={styles.messageRow}>
              <span className={styles.sender} style={{ color: msg.color }}>{msg.sender}</span>
              <span className={styles.text}>{msg.text}</span>
            </div>
          ))}
          <div ref={subEndRef} />
        </div>
      </div>

      <div className={styles.expressionBar}>
        {['通常', '笑顔', '驚き', '悲しみ', '怒り', '困惑'].map((expr) => (
          <button key={expr} type="button" className={styles.expressionBtn}
            onClick={() => setInputValue(prev => prev + `@${expr}`)} title={`@${expr} を追加`}>
            {expr === '通常' && '😐'}{expr === '笑顔' && '😊'}{expr === '驚き' && '😲'}
            {expr === '悲しみ' && '😢'}{expr === '怒り' && '😠'}{expr === '困惑' && '😰'}
          </button>
        ))}
      </div>

      <form className={styles.inputArea} onSubmit={handleSend}>
        <div className={styles.channelTabs}>
          <button type="button" className={`${styles.channelTab} ${activeChannel === 'main' ? styles.active : ''}`}
            onClick={() => setActiveChannel('main')}>本編</button>
          <button type="button" className={`${styles.channelTab} ${activeChannel === 'sub' ? styles.active : ''}`}
            onClick={() => setActiveChannel('sub')}>雑談</button>
        </div>
        <input className={styles.input} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          placeholder={activeChannel === 'main' ? '本編に発言...' : '雑談に発言...'} />
        <button type="submit" className={styles.sendButton}><Send size={16} /></button>
      </form>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import styles from './ChatPanel.module.css';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'System', text: 'Welcome to the session!', timestamp: '12:00' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageRow}>
            <span className={styles.sender}>{msg.sender}:</span>
            <span className={styles.text}>{msg.text}</span>
            <span className={styles.time}>{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className={styles.inputArea} onSubmit={handleSend}>
        <input 
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className={styles.sendButton}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

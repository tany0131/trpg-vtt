import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Minimize2, GripVertical } from 'lucide-react';
import styles from './MainLogPanel.module.css';

interface LogMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  color?: string;
}

interface MainLogPanelProps {
  messages: LogMessage[];
}

export function MainLogPanel({ messages }: MainLogPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // 0 = 中央
  const [size, setSize] = useState({ width: 500, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ドラッグ処理
  const handleDragStart = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        setPosition({
          x: e.clientX - parentRect.left - dragOffset.current.x,
          y: e.clientY - parentRect.top - dragOffset.current.y
        });
      }
    }
    if (isResizing) {
      setSize(prev => ({
        width: Math.max(300, prev.width + e.movementX),
        height: Math.max(150, prev.height + e.movementY)
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  // 中央配置のスタイル計算
  const positionStyle = position.x === 0 && position.y === 0
    ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
    : { left: position.x, top: position.y };

  if (isMinimized) {
    return (
      <div className={styles.minimized} onClick={() => setIsMinimized(false)}>
        <MessageSquare size={16} />
        <span>本編ログ ({messages.length})</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{
        ...positionStyle,
        width: size.width,
        height: size.height,
      }}
    >
      {/* ヘッダー（ドラッグハンドル） */}
      <div className={styles.header} onMouseDown={handleDragStart}>
        <GripVertical size={14} className={styles.grip} />
        <MessageSquare size={14} />
        <span className={styles.title}>本編ログ</span>
        <button 
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
        >
          <Minimize2 size={14} />
        </button>
      </div>

      {/* メッセージエリア */}
      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageRow}>
            <span 
              className={styles.sender}
              style={{ color: msg.color || 'var(--accent-primary)' }}
            >
              {msg.sender}
            </span>
            <span className={styles.text}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* リサイズハンドル */}
      <div 
        className={styles.resizeHandle}
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
}

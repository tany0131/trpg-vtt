import { useEffect, useState } from 'react';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  sender: string;
  text: string;
  color: string;
  expression?: string;
  onComplete?: () => void;
}

export function MessageBubble({ sender, text, color, expression, onComplete }: MessageBubbleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // タイプライター効果
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        // 3分後に自動で消える (新しいメッセージでリセットされる)
        setTimeout(() => {
          onComplete?.();
        }, 180000); // 3分 = 180秒 = 180000ms
      }
    }, 30); // 30msごとに1文字

    return () => clearInterval(interval);
  }, [text, onComplete]);

  // 表情から絵文字を取得
  const getExpressionEmoji = (expr?: string) => {
    const map: Record<string, string> = {
      '通常': '😐',
      '笑顔': '😊',
      '驚き': '😲',
      '悲しみ': '😢',
      '怒り': '😠',
      '困惑': '😰',
    };
    return expr ? map[expr] || '😐' : null;
  };

  const emoji = getExpressionEmoji(expression);

  return (
    <div className={`${styles.container} ${isComplete ? styles.complete : ''}`}>
      {/* キャラクターアバター */}
      <div className={styles.avatarSection}>
        <div 
          className={styles.avatar}
          style={{ borderColor: color, boxShadow: `0 0 15px ${color}40` }}
        >
          <span className={styles.avatarLetter}>{sender.charAt(0)}</span>
          {emoji && <span className={styles.expression}>{emoji}</span>}
        </div>
      </div>

      {/* メッセージウィンドウ */}
      <div className={styles.messageWindow}>
        <div className={styles.nameTag} style={{ background: color }}>
          {sender}
        </div>
        <div className={styles.textArea}>
          <p className={styles.text}>
            {displayedText}
            {!isComplete && <span className={styles.cursor}>▌</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

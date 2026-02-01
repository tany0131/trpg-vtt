import { useRef, useState } from 'react';
import { Swords, Image } from 'lucide-react';
import styles from './MapCanvas.module.css';
import { Token } from './Token';

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface TokenState {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

interface SceneState {
  background?: string;
  foreground?: string;
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [tokens, setTokens] = useState<TokenState[]>([
    { id: '1', x: 400, y: 300, label: 'Hero', color: '#3b82f6' },
    { id: '2', x: 500, y: 300, label: 'Orc', color: '#ef4444' },
  ]);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [scene, setScene] = useState<SceneState>({
    background: undefined,
    foreground: undefined,
  });

  // Drag state
  const isDraggingMap = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggingTokenId = useRef<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 && !draggingTokenId.current) {
       // Pan map with left click background
       isDraggingMap.current = true;
       dragStart.current = { x: e.clientX, y: e.clientY };
       containerRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingMap.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      setView(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else if (draggingTokenId.current) {
      const dx = (e.clientX - dragStart.current.x) / view.scale;
      const dy = (e.clientY - dragStart.current.y) / view.scale;

      setTokens(prev => prev.map(t => {
        if (t.id === draggingTokenId.current) {
          return { ...t, x: t.x + dx, y: t.y + dy };
        }
        return t;
      }));
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingMap.current = false;
    draggingTokenId.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleTokenDragStart = (e: React.PointerEvent, id: string) => {
    draggingTokenId.current = id;
    dragStart.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handleZoom = (delta: number) => {
    setView(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale + delta))
    }));
  };

  // 背景設定（デモ用のプレースホルダー関数）
  const handleSetBackground = () => {
    const url = prompt('背景画像のURLを入力:');
    if (url) {
      setScene(prev => ({ ...prev, background: url }));
    }
  };

  return (
    <div 
      className={`${styles.mapContainer} ${isBattleMode ? styles.battleMode : ''}`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 背景レイヤー */}
      {scene.background && (
        <div 
          className={styles.backgroundLayer}
          style={{ backgroundImage: `url(${scene.background})` }}
        />
      )}

      <div 
        className={styles.world}
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`
        }}
      >
        <div className={`${styles.gridLayer} ${isBattleMode ? styles.battleGrid : ''}`} />
        <div className={styles.contentLayer}>
          {tokens.map(token => (
            <Token
              key={token.id}
              {...token}
              onDragStart={handleTokenDragStart}
            />
          ))}
        </div>
      </div>

      {/* 前景レイヤー */}
      {scene.foreground && (
        <div 
          className={styles.foregroundLayer}
          style={{ backgroundImage: `url(${scene.foreground})` }}
        />
      )}
      
      {/* コントロール */}
      <div className={styles.controls}>
        <div className={styles.zoomControl}>
          <button onClick={() => handleZoom(0.1)}>+</button>
          <span>{Math.round(view.scale * 100)}%</span>
          <button onClick={() => handleZoom(-0.1)}>-</button>
        </div>
        
        {/* 戦闘モード切り替え */}
        <button 
          className={`${styles.modeBtn} ${isBattleMode ? styles.active : ''}`}
          onClick={() => setIsBattleMode(!isBattleMode)}
          title="戦闘モード"
        >
          <Swords size={18} />
        </button>

        {/* 背景設定 */}
        <button 
          className={styles.modeBtn}
          onClick={handleSetBackground}
          title="背景設定"
        >
          <Image size={18} />
        </button>
      </div>
    </div>
  );
}


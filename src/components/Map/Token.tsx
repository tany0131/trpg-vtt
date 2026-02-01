import React from 'react';
import styles from './Token.module.css';

interface TokenProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
  image?: string;
  onDragStart?: (e: React.PointerEvent, id: string) => void;
}

export function Token({ id, x, y, label, color = '#c4a052', image, onDragStart }: TokenProps) {
  
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent map panning
    onDragStart?.(e, id);
  };

  return (
    <div 
      className={styles.token}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        borderColor: color,
        '--token-color': color
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
    >
      {image ? (
        <img src={image} className={styles.image} alt={label} draggable={false} />
      ) : (
        <div className={styles.placeholder} style={{ background: color }} />
      )}
      
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}

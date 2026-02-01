import { ReactNode } from 'react';
import styles from './GameLayout.module.css';

interface GameLayoutProps {
  children?: ReactNode;
  sidebar?: ReactNode;
  overlay?: ReactNode;
}

export function GameLayout({ children, sidebar, overlay }: GameLayoutProps) {
  return (
    <div className={styles.container}>
      <main className={styles.mainArea}>
        {children}
      </main>
      
      {sidebar && (
        <aside className={styles.sidebar}>
          {sidebar}
        </aside>
      )}

      {overlay}
    </div>
  );
}

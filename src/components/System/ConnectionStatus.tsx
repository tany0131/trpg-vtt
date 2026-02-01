import { Wifi, WifiOff } from 'lucide-react';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  return (
    <div className={`${styles.container} ${isConnected ? styles.connected : styles.disconnected}`}>
      {isConnected ? (
        <>
          <Wifi size={14} />
          <span>接続中</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>{error || '切断'}</span>
        </>
      )}
    </div>
  );
}

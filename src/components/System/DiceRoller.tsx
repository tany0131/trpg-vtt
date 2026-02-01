import { useState } from 'react';
import styles from './DiceRoller.module.css';
import { Dices } from 'lucide-react';

export function DiceRoller() {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResult(null);
    
    // Animation duration
    setTimeout(() => {
      const newResult = Math.floor(Math.random() * 6) + 1;
      setResult(newResult);
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.rollButton} 
        onClick={rollDice}
        disabled={isRolling}
      >
        <Dices size={24} />
      </button>

      {(isRolling || result !== null) && (
        <div className={styles.scene}>
          <div 
            className={`${styles.cube} ${isRolling ? styles.rolling : ''}`}
            data-result={result}
          >
            <div className={`${styles.face} ${styles.front}`}>1</div>
            <div className={`${styles.face} ${styles.back}`}>6</div>
            <div className={`${styles.face} ${styles.right}`}>3</div>
            <div className={`${styles.face} ${styles.left}`}>4</div>
            <div className={`${styles.face} ${styles.top}`}>2</div>
            <div className={`${styles.face} ${styles.bottom}`}>5</div>
          </div>
        </div>
      )}
    </div>
  );
}

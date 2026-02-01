import { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import styles from './CharacterSwitcher.module.css';

interface Character {
  id: string;
  name: string;
  type: 'pc' | 'npc' | 'pl';
  color: string;
  avatar?: string;
}

interface CharacterSwitcherProps {
  isGM?: boolean;
}

export function CharacterSwitcher({ isGM = false }: CharacterSwitcherProps) {
  const [characters] = useState<Character[]>([
    { id: '1', name: 'プレイヤー', type: 'pl', color: '#888' },
    { id: '2', name: '探索者A', type: 'pc', color: '#3b82f6' },
    { id: '3', name: '探索者B', type: 'pc', color: '#22c55e' },
    ...(isGM ? [
      { id: '4', name: 'NPC老人', type: 'npc' as const, color: '#f59e0b' },
      { id: '5', name: 'NPC店主', type: 'npc' as const, color: '#ef4444' },
    ] : []),
  ]);
  
  const [activeCharId, setActiveCharId] = useState(characters[1]?.id || characters[0]?.id);
  const [isOpen, setIsOpen] = useState(false);

  const activeChar = characters.find(c => c.id === activeCharId);

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <Users size={14} />
        <span>発言キャラ</span>
      </div>

      <button 
        className={styles.selector}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div 
          className={styles.avatar} 
          style={{ background: activeChar?.color }}
        >
          {activeChar?.name.charAt(0)}
        </div>
        <span className={styles.name}>{activeChar?.name}</span>
        <span className={styles.type}>
          {activeChar?.type === 'pc' ? 'PC' : activeChar?.type === 'npc' ? 'NPC' : 'PL'}
        </span>
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {characters.map((char) => (
            <button
              key={char.id}
              className={`${styles.option} ${char.id === activeCharId ? styles.active : ''}`}
              onClick={() => {
                setActiveCharId(char.id);
                setIsOpen(false);
              }}
            >
              <div 
                className={styles.avatar} 
                style={{ background: char.color }}
              >
                {char.name.charAt(0)}
              </div>
              <span className={styles.optionName}>{char.name}</span>
              <span className={styles.optionType}>
                {char.type === 'pc' ? 'PC' : char.type === 'npc' ? 'NPC' : 'PL'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

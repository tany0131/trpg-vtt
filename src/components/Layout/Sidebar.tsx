
import { Users, MessageSquare, Box, Settings, Map as MapIcon, ChevronLeft } from 'lucide-react';
import styles from './Sidebar.module.css';
import { CharacterSwitcher } from './CharacterSwitcher';
import { User } from '../../hooks/useSocket';

interface SidebarProps {
    users?: User[];
}

export function Sidebar({ users = [] }: SidebarProps) {  const navItems = [
    { icon: <Users size={20} />, label: "Characters" },
    { icon: <MapIcon size={20} />, label: "Maps", active: true },
    { icon: <Box size={20} />, label: "Objects" },
    { icon: <MessageSquare size={20} />, label: "Chat" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className={styles.sidebarContent}>
      <header className={styles.header}>
        <div className={styles.title}>VTT Proto</div>
        <button className={styles.collapseBtn}>
          <ChevronLeft size={16} />
        </button>
      </header>
      
      <nav className={styles.nav}>
        {navItems.map((item, index) => (
          <button 
            key={index} 
            className={`${styles.navItem} ${item.active ? styles.active : ''}`}
          >
            {item.icon}
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* キャラ切り替えUI */}
      <CharacterSwitcher isGM={true} />

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>T</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Player</div>
            <div className={styles.userStatus}>Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}


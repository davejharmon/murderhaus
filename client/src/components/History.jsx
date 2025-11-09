// src/components/History.jsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import styles from './History.module.css';

const LogEntry = React.memo(({ entry }) => {
  const { message, type = 'system', timestamp } = entry;
  const typeColors = {
    system: '#999',
    player: '#555',
    murder: '#d32f2f',
    default: '#333',
  };
  const color = typeColors[type] || typeColors.default;
  const ts = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li style={{ color }}>
      [{ts}] {message}
    </li>
  );
});

export default function History() {
  const { log = [] } = useGameState(['LOG_UPDATE']);

  return (
    <div>
      <div className={styles.historyHeader}>
        <h3>History</h3>
      </div>
      <ul className={styles.historyList}>
        {log.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

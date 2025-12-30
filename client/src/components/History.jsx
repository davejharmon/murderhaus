// src/components/History.jsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import styles from './History.module.css';
import { DEBUG } from '../../../shared/constants';

const LogEntry = React.memo(({ entry }) => {
  const { message, type = 'system', timestamp } = entry;
  const typeColors = {
    system: '#999',
    warn: '#FFB300',
    error: '#d32f2f',
    info: '#777',
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
  const { log = [] } = useGameState();
  // filter out system messages if flag is false
  const displayedLog = DEBUG.showSystemLogs
    ? log
    : log.filter((entry) => entry.type !== 'system');
  return (
    <div>
      <div className={styles.historyHeader}>
        <h3>History</h3>
      </div>
      <ul className={styles.historyList}>
        {displayedLog.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

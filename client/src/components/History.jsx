// src/components/History.jsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { DEBUG } from '@shared/constants';
import styles from './History.module.css';

const LogEntry = React.memo(({ entry }) => {
  const { message, type = 'system', timestamp } = entry;

  const typeColors = {
    info: '#1976d2',
    warn: '#ed6c02',
    error: '#d32f2f',
    system: '#6b7280',
    debug: '#9ca3af',
  };

  const color = typeColors[type] || typeColors.system;
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
  const visibleLog = DEBUG.showDebugLogs
    ? log
    : log.filter((entry) => entry.type !== 'debug');

  return (
    <div>
      <div className={styles.historyHeader}>
        <h3>History</h3>
      </div>
      <ul className={styles.historyList}>
        {visibleLog.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

// src/pages/DebugPlayers.jsx
import React from 'react';
import Player from './Player';
import styles from './DebugPlayers.module.css';

export default function DebugPlayers() {
  const playerIds = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className={styles.gridContainer}>
      {playerIds.map((id) => (
        <div key={id} className={styles.gridItem}>
          <Player id={id} compact={true} />
        </div>
      ))}
    </div>
  );
}

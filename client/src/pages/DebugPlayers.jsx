// src/pages/DebugPlayers.jsx
import React from 'react';
import Player from './Player';
import styles from './DebugPlayers.module.css';
import { MAX_PLAYERS } from '@shared/constants'; // ensure this is defined

export default function DebugPlayers() {
  const playerIds = Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1);

  return (
    <div className={styles.gridContainer}>
      {playerIds.map((id) => (
        <div key={id} className={styles.gridItem}>
          {/* Each Player will connect and register automatically */}
          <Player id={id} compact={true} />
        </div>
      ))}
    </div>
  );
}

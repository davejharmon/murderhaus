// src/pages/DebugPlayers.jsx
import React, { useEffect } from 'react';
import Player from './Player';
import styles from './DebugPlayers.module.css';
import { MAX_PLAYERS } from '@shared/constants';
import { send } from '../ws';

export default function DebugPlayers({ gameState, wsStatus }) {
  // Staggered registration
  useEffect(() => {
    const timeouts = [];
    for (let i = 1; i <= MAX_PLAYERS; i++) {
      const t = setTimeout(() => send('REGISTER_PLAYER', { id: i }), i * 50);
      timeouts.push(t);
    }
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  const playerIds = Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1);

  return (
    <div className={styles.gridContainer}>
      {playerIds.map((id) => (
        <div key={id} className={styles.gridItem}>
          <Player
            id={id}
            compact={true}
            gameState={gameState}
            wsStatus={wsStatus}
          />
        </div>
      ))}
    </div>
  );
}

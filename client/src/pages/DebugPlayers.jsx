// src/pages/DebugPlayers.jsx
import React from 'react';
import Player from './Player';
import styles from './DebugPlayers.module.css';
import { MAX_PLAYERS } from '@shared/constants';
import { usePageTitle } from '../hooks/usePageTitle';

export default function DebugPlayers() {
  const playerIds = Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1);
  usePageTitle('Players');
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

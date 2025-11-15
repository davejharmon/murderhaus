// src/components/BigScreen/PlayerGallery.jsx
import React from 'react';
import Portrait from './Portrait';
import styles from './BigScreen.module.css';

/**
 * Displays a row of player portraits with status indicators.
 * Dead players are semi-transparent.
 * Revealed enemies (e.g., werewolves) are tinted red.
 */
export default function PlayerGallery({ players = [], size = 64 }) {
  return (
    <div className={styles.playerGallery}>
      {players.map((player) => (
        <div
          key={player.id}
          style={{
            opacity: player.state?.isAlive ? 1 : 0.5,
            margin: '0 0.25rem',
          }}
        >
          <Portrait player={player} size={size} />
        </div>
      ))}
    </div>
  );
}

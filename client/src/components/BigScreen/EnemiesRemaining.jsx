// src/components/BigScreen/EnemiesRemaining.jsx
import React from 'react';
import Portrait from './Portrait';
import styles from './BigScreen.module.css';

/**
 * Displays the remaining enemies count and their portraits.
 * Dead players are shown before alive players.
 */
export default function EnemiesRemaining({ enemies = [], size = 64 }) {
  const sortedEnemies = [...enemies].sort(
    (a, b) => (a.state?.isAlive ? 1 : 0) - (b.state?.isAlive ? 1 : 0)
  );

  return (
    <div className={styles.enemiesRemaining}>
      <h3>{enemies.length} ENEMIES REMAIN</h3>
      <div className={styles.enemyPortraitRow}>
        {sortedEnemies.map((player) => (
          <Portrait
            key={player.id}
            player={player}
            anon={player.state?.isAlive}
            size={size}
            style={{ opacity: player.state?.isAlive ? 1 : 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}

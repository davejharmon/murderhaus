import React from 'react';
import styles from './BigScreen.module.css';

export default function PlayerUpdate({ player, text, showRole = false }) {
  if (!player) return null;

  const isEnemy = showRole && player.team === 'werewolves';

  const portraitClasses = [
    styles.portrait, // base portrait
    styles.large, // large size token
    isEnemy ? styles.enemy : '', // enemy filter modifier
  ]
    .filter(Boolean)
    .join(' ');

  const mainLabel = showRole ? player.role : player.name;

  return (
    <div className={styles.playerUpdateContainer}>
      <img
        className={portraitClasses}
        src={`/images/players/${player.image}`}
        alt={player.name}
      />

      <div>
        <div className={styles.targetName}>{mainLabel}</div>
        <div className={styles.subtitle}>{text}</div>
      </div>
    </div>
  );
}

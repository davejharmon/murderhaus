import React from 'react';
import styles from './BigScreen.module.css';
export default function PlayerUpdate({ player, text, showRole = false }) {
  if (!player) return null;
  console.log(showRole, player);
  const portraitStyle =
    showRole && player.team === 'werewolves'
      ? styles.playerUpdatePortraitEnemy
      : styles.playerUpdatePortrait;
  return (
    <div className={styles.playerUpdateContainer}>
      <img
        className={portraitStyle}
        src={`/images/players/${player.image}`}
        alt={player.name}
      />
      <div>
        <div>{showRole ? player.role : player.name}</div>
        <div>{text}</div>
      </div>
    </div>
  );
}

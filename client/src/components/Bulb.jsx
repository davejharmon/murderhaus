// src/components/Bulb.jsx
import React from 'react';
import styles from './Bulb.module.css';

export function Bulb({ player, size = 40, phase }) {
  if (!player) return null;

  const { color } = player;
  const { isAlive, diedThisTurn, actions } = player.state;

  // Derive UI states from the Player.js data structure
  const selecting = actions.some(
    (a) => a.selectedTarget !== null && !a.confirmed
  );

  const confirmed = actions.some((a) => a.confirmed === true);

  const classes = [styles.bulb];

  if (!phase) classes.push(styles.default);

  if (isAlive && phase === 'day') classes.push(styles.aliveDay);
  if (isAlive && phase === 'night') classes.push(styles.aliveNight);

  if (!isAlive) classes.push(styles.dead);
  if (diedThisTurn) classes.push(styles.diedThisTurn);

  if (selecting) classes.push(styles.selectionEntered);
  if (confirmed) classes.push(styles.selectionConfirmed);

  return (
    <div
      className={classes.join(' ')}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

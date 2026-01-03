// src/components/Bulb.jsx
import React from 'react';
import styles from './Bulb.module.css';

export function Bulb({ player, size = 40, phase }) {
  if (!player) return null;
  const { isDead, availableActions = [] } = player;
  // Derive UI states from the Player.js data structure
  const selecting = availableActions.some(
    (a) => a.selectedTarget !== null && !a.confirmed
  );

  const confirmed = availableActions.some((a) => a.confirmed === true);

  const classes = [styles.bulb];

  if (!phase) classes.push(styles.default);

  if (!isDead && phase === 'day') classes.push(styles.aliveDay);
  if (!isDead && phase === 'night') classes.push(styles.aliveNight);

  if (isDead) classes.push(styles.dead);
  // died this turn logic

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

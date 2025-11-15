// src/components/BigScreen/BigPortraitUpdate.jsx
import React from 'react';
import { NumberEmoji } from '../NumberEmoji';
import styles from './BigScreen.module.css';
import Portrait from './Portrait';

export default function BigPortraitUpdate({ player, title, color }) {
  if (!player) return null;

  return (
    <div
      className={styles.bigPortraitUpdate}
      style={{ borderColor: color || '#000' }}
    >
      <h1 className={styles.bigTitle}>{title}</h1>
      <div className={styles.bigPortrait}>
        <Portrait player={player} />
      </div>
    </div>
  );
}

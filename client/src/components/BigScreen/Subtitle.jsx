import React from 'react';
import styles from './BigScreen.module.css';

export default function Subtitle({ text, color, size }) {
  if (!text) return null;

  const style = {};
  if (color) style.color = color;
  if (size) style.fontSize = size;

  return (
    <div className={styles.subtitle} style={style}>
      {text}
    </div>
  );
}

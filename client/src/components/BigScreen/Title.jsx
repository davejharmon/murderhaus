import React from 'react';
import styles from './BigScreen.module.css';

export default function Title({ text, color, size }) {
  if (!text?.trim()) return null;

  const style = {};
  if (color) style.color = color;
  if (size) style.fontSize = size;

  return (
    <div className={styles.title} style={style}>
      {text}
    </div>
  );
}

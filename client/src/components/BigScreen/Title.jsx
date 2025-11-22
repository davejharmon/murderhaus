import React from 'react';
import styles from './BigScreen.module.css';
export default function Title({ text, color }) {
  if (!text) return null;

  return (
    <div className={styles.title} style={{ color }}>
      {text}
    </div>
  );
}

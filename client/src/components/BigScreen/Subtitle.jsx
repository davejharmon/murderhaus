import React from 'react';
import styles from './BigScreen.module.css';
export default function Subtitle({ text }) {
  if (!text) return null;

  return <div className={styles.subtitle}>{text}</div>;
}

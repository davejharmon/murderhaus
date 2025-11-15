// src/components/BigScreen/Subtitle.jsx
import React from 'react';
import styles from './BigScreen.module.css';

export default function Subtitle({ text }) {
  return <h2 className={styles.subtitle}>{text}</h2>;
}

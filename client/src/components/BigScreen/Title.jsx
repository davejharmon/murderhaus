// src/components/BigScreen/Title.jsx
import React from 'react';
import styles from './BigScreen.module.css';

export default function Title({ text }) {
  return <h1 className={styles.bigTitle}>{text}</h1>;
}

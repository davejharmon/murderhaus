import React from 'react';
import styles from './BigScreen.module.css';

export default function SingleImage({ path, alt = '', className }) {
  if (!path) return null;

  return (
    <img
      src={path}
      alt={alt}
      className={`${styles.singleImage} ${className || ''}`}
    />
  );
}

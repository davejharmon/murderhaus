// src/components/TinyScreen.jsx
import { useEffect, useState } from 'react';
import { subscribe } from '../ws';
import styles from './TinyScreen.module.css';

export function TinyScreen({ playerId }) {
  const [message, setMessage] = useState(
    'choose a player to eliminate & press C to confirm'
  );

  useEffect(() => {
    const unsub = subscribe(`PLAYER_TINYSCR:${playerId}`, (data) => {
      if (data?.text && typeof data.text === 'string') {
        setMessage(data.text.slice(0, 100)); // max 100 chars
      }
    });
    return () => unsub();
  }, [playerId]);

  return <div className={styles.tinyScreen}>{message}</div>;
}

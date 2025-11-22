import React, { useEffect, useState } from 'react';
import styles from './BigScreen.module.css';

export default function CountdownTimer({ countdown }) {
  const [endTime, setEndTime] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setEndTime(Date.now() + countdown * 1000);
  }, [countdown]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(i);
  }, []);

  if (!endTime)
    return (
      <div className={`${styles.countdown}`}>
        <span style={{ visibility: 'hidden' }}>00:00</span>
      </div>
    );

  const diff = Math.max(0, endTime - now);
  const seconds = Math.ceil(diff / 1000);

  if (seconds <= 0)
    return (
      <div className={`${styles.countdown}`}>
        <span style={{ visibility: 'hidden' }}>00:00</span>
      </div>
    );

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  // Determine animation intensity
  let juiceClass = '';
  if (seconds <= 30) juiceClass = styles.juice30;

  return (
    <div className={`${styles.countdown} ${juiceClass}`}>
      {mm}:{ss}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import styles from './BigScreen.module.css';

export default function CountdownTimer({ countdown }) {
  const [endTime, setEndTime] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Set new end time whenever countdown changes
  useEffect(() => {
    if (countdown) {
      setEndTime(Date.now() + countdown * 1000);
    }
  }, [countdown]);

  // Update "now" every 100ms
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // TIME CALCULATION
  // -----------------------------
  let display = '00:00';

  if (endTime) {
    const diff = Math.max(0, endTime - now);
    const seconds = Math.ceil(diff / 1000);

    if (seconds > 0) {
      const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
      const ss = String(seconds % 60).padStart(2, '0');
      display = `${mm}:${ss}`;
    }
  }

  const secondsRemaining = endTime
    ? Math.ceil(Math.max(0, endTime - now) / 1000)
    : 0;

  const juiceClass =
    secondsRemaining > 0 && secondsRemaining <= 30 ? styles.juice30 : '';

  return <div className={`${styles.countdown} ${juiceClass}`}>{display}</div>;
}

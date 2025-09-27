import React, { useState, useEffect } from 'react';
import { subscribeStatus } from '../ws'; // adjust path

const Badge = () => {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const unsubscribe = subscribeStatus(setStatus);
    return unsubscribe;
  }, []);

  const getStatusEmoji = () => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔴';
      case 'connecting':
        return '🟡';
      case 'error':
        return '⚠️';
      default:
        return '⚪';
    }
  };

  return <div style={styles.badge}>{getStatusEmoji()}</div>;
};

const styles = {
  badge: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    fontSize: '20px',
    fontWeight: 'bold',
  },
};

export default Badge;

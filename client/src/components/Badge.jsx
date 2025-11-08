// src/components/Badge.jsx
import React from 'react';

const Badge = ({ status = 'connecting' }) => {
  const getColor = () => {
    switch (status) {
      case 'connected':
        return '#4CAF50'; // green
      case 'disconnected':
        return '#F44336'; // red
      case 'connecting':
        return '#FFC107'; // amber
      case 'error':
        return '#FF9800'; // orange
      default:
        return '#9E9E9E'; // gray
    }
  };

  return (
    <div
      style={{ ...styles.badge, backgroundColor: getColor() }}
      title={`WebSocket status: ${status}`}
      aria-label={`WebSocket status: ${status}`}
    />
  );
};

const styles = {
  badge: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    transition: 'background-color 0.2s ease',
  },
};

export default Badge;

// src/components/BigScreen/Portrait.jsx
import React from 'react';
import styles from './BigScreen.module.css';

/**
 * Portrait component for a player.
 * Currently renders a simple emoji based on player ID.
 */
export default function Portrait({ player, size = 64, anon = false }) {
  // Map player ID 1-9 to emoji numbers
  const numberEmojiMap = ['😺', '🤖', '🐶', '🐸', '🐵', '🦁', '🐮', '🐯', '👻'];
  const anonEmoji = '❓';
  const emoji = numberEmojiMap[(player.id || 1) - 1] || '❓';

  // Dynamic style for circle + size
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: player.state?.isAlive
      ? player.role?.color || '#ccc'
      : '#888',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: size * 0.6,
    color: '#000',
    opacity: player.state?.isAlive ? 1 : 0.4,
    border: '2px solid #000',
  };

  return <div style={style}>{anon ? anonEmoji : emoji}</div>;
}

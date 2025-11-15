// Keypad.jsx
import React from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { MAX_PLAYERS } from '@shared/constants';

export const Keypad = ({ player }) => {
  if (!player) return <div>Loading player...</div>;

  // keyStates: { '1': 'enabled' | 'disabled' | 'highlighted', ... }
  const keyStates = player.keyStates ?? {};

  const handleClick = (key) => {
    send('PLAYER_INPUT', {
      actorId: player.id,
      key,
    });
  };

  const allKeys = [
    ...Array.from({ length: MAX_PLAYERS }, (_, i) => String(i + 1)),
    'A',
    'B',
    'confirm',
  ];

  return (
    <div style={styles.keypad}>
      {allKeys.map((label) => (
        <Button
          key={label}
          label={label === 'confirm' ? 'C' : label}
          state={keyStates[label] ?? 'disabled'}
          onClick={() => handleClick(label)}
        />
      ))}
    </div>
  );
};

const styles = {
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    justifyItems: 'stretch',
    width: '100%',
  },
};

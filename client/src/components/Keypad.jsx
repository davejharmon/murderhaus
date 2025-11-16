// Keypad.jsx
import React from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { ALL_KEYS } from '@shared/constants';

export const Keypad = ({ player }) => {
  if (!player) return <div>Loading player...</div>;

  const handleClick = (key) => {
    send('PLAYER_INPUT', {
      actorId: player.id,
      key,
    });
  };

  const keymap = player.keyStates ?? {};

  return (
    <div style={styles.keypad}>
      {ALL_KEYS.map((key) => {
        const km = keymap[key] ?? {};

        return (
          <Button
            key={key}
            label={key === 'confirm' ? 'C' : key}
            state={km.isHighlighted ? 'selected' : 'enabled'}
            onClick={() => handleClick(key)}
            disabled={km.isDisabled}
          />
        );
      })}
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

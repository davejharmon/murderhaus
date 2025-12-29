// src/components/Keypad.jsx
import React from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { ACTION_KEYS } from '@shared/constants';
import styles from './Keypad.module.css';

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
    <div className={styles.keypad}>
      {ACTION_KEYS.map((key) => {
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

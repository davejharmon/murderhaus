// Keypad.jsx
import React from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { MAX_PLAYERS } from '@shared/constants';

export const Keypad = ({ player }) => {
  if (!player) return <div>Loading player...</div>;

  const enabled = new Set(player.enabledKeys ?? []);

  const handleClick = (key) => {
    send('PLAYER_INPUT', {
      actorId: player.id,
      key,
    });
  };

  const getButtonState = (label) =>
    enabled.has(label) ? 'unlocked' : 'locked';

  const numericButtons = Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const label = String(i + 1);
    return (
      <Button
        key={label}
        label={label}
        onClick={() => handleClick(label)}
        state={getButtonState(label)}
      />
    );
  });

  const letterButtons = ['A', 'B'].map((label) => (
    <Button
      key={label}
      label={label}
      onClick={() => handleClick(label)}
      state={getButtonState(label)}
      disabled={!enabled.has(label)}
    />
  ));

  const confirmButton = (
    <Button
      key='C'
      label='C'
      onClick={() => handleClick('confirm')}
      state={getButtonState('confirm')}
      disabled={!enabled.has('confirm')}
    />
  );

  return (
    <div style={styles.keypad}>
      {[...numericButtons, ...letterButtons, confirmButton]}
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

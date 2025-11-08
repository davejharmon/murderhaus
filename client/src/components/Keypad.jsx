// src/components/Keypad.jsx
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { MAX_PLAYERS } from '@shared/constants.js';

export const Keypad = ({ player, activeActions = [], onKeypress }) => {
  if (!player) return <div>Loading player...</div>;

  const [selection, setSelection] = useState(player.selection ?? null);
  const [isConfirmed, setIsConfirmed] = useState(player.isConfirmed ?? false);

  const actionType = activeActions[0] || null;
  const validTargets = player.activeActionTargets?.[actionType] ?? [];

  useEffect(() => {
    setSelection(player.selection ?? null);
    setIsConfirmed(player.isConfirmed ?? false);
  }, [player.selection, player.isConfirmed]);

  const handleClick = (key) => {
    if (isConfirmed && key !== 'interrupt') return; // keypad locked after confirm, except interrupt

    if (key === 'confirm') {
      if (!selection) return;
      setIsConfirmed(true);
      send('PLAYER_CONFIRM_ACTION', {
        playerId: player.id,
        action: actionType,
      });
    } else if (key === 'interrupt') {
      send('PLAYER_INTERRUPT', { playerId: player.id });
    } else {
      const target = selection === key ? null : key;
      setSelection(target);
      send('PLAYER_ACTION', {
        playerId: player.id,
        action: actionType,
        target,
      });
    }

    // Optional callback
    if (onKeypress) onKeypress(key);
  };

  // Buttons 1–MAX_PLAYERS
  const numberButtons = Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const id = i + 1;
    const isValid = validTargets.includes(id);
    const isSelected = selection === id;

    return (
      <Button
        key={id}
        label={id}
        onClick={() => handleClick(id)}
        disabled={!isValid && !isSelected}
        state={isSelected ? 'selected' : 'unlocked'}
      />
    );
  });

  return (
    <div style={styles.keypad}>
      {numberButtons}
      <Button
        label='Confirm'
        onClick={() => handleClick('confirm')}
        disabled={!selection || isConfirmed}
        state={isConfirmed ? 'confirmed' : 'unlocked'}
      />
      <Button
        label='Interrupt'
        onClick={() => handleClick('interrupt')}
        disabled={player.interruptUsed} // optional flag to prevent multiple
        state={player.interruptUsed ? 'disabled' : 'unlocked'}
      />
    </div>
  );
};

const styles = {
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 3 rows × 4 cols
    gap: '0.5rem',
    justifyItems: 'stretch',
    width: '100%',
  },
};

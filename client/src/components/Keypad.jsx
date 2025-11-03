// Keypad.jsx
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { MAX_PLAYERS } from '@shared/constants.js';

export const Keypad = ({ player, actionType }) => {
  if (!player) return <div>Loading player...</div>;

  const [selection, setSelection] = useState(player.selection ?? null);
  const [isConfirmed, setIsConfirmed] = useState(player.isConfirmed ?? false);

  const validTargets = player.activeActionTargets?.[actionType] ?? [];

  useEffect(() => {
    setSelection(player.selection ?? null);
    setIsConfirmed(player.isConfirmed ?? false);
  }, [player.selection, player.isConfirmed]);

  const handleClick = (targetId) => {
    if (isConfirmed) return; // keypad locked after confirm

    if (targetId === 'confirm') {
      if (!selection) return;
      setIsConfirmed(true);
      send('PLAYER_CONFIRM_ACTION', {
        playerId: player.id,
        action: actionType,
      });
    } else {
      const newSelection = selection === targetId ? null : targetId;
      setSelection(newSelection);
      send('PLAYER_ACTION', {
        playerId: player.id,
        action: actionType,
        target: newSelection,
      });
    }
  };

  return (
    <div style={styles.keypad}>
      {Array.from({ length: MAX_PLAYERS }, (_, i) => {
        const id = i + 1;
        const isValid = validTargets.includes(id);
        const isSelected = selection === id;

        return (
          <Button
            key={id}
            label={id}
            onClick={() => handleClick(id)}
            disabled={!isValid && selection !== id} // locked unless selected
            state={selection === id ? 'selected' : 'unlocked'}
          />
        );
      })}

      <Button
        label='Confirm'
        onClick={() => handleClick('confirm')}
        disabled={!selection || isConfirmed}
        state={isConfirmed ? 'confirmed' : 'unlocked'}
      />
    </div>
  );
};

const styles = {
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem',
    justifyItems: 'stretch',
    width: '100%',
  },
};

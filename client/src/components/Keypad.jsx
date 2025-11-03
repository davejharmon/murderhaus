import { useState } from 'react';
import { Button } from './Button';

export const Keypad = ({ onKeypress, player, isLocked = false }) => {
  if (!player) return <div>Loading player...</div>; // safeguard

  const [selection, setSelection] = useState(player?.vote ?? null);
  const [isConfirmed, setIsConfirmed] = useState(player?.isConfirmed ?? false);

  const isUnlocked = (action) => player?.activeActions?.includes(action);

  const handleButtonClick = (value) => {
    if (!isUnlocked('vote')) return;

    if (value === 'confirm') {
      setIsConfirmed(true);
      onKeypress('confirm', 'vote'); // send action type
    } else {
      setSelection(value);
      setIsConfirmed(false);
      onKeypress(value, 'vote'); // send action type
    }
  };

  const buttons = [...Array(9)].map((_, i) => i + 1);

  return (
    <div style={styles.keypad}>
      {buttons.map((value) => {
        let state = null;
        if (!isLocked) state = 'unlocked';
        if (selection === value && !isConfirmed) state = 'selected';

        return (
          <Button
            key={value}
            label={value}
            onClick={() => handleButtonClick(value)}
            disabled={isLocked}
            state={state}
          />
        );
      })}
      <Button
        label='Confirm'
        onClick={() => handleButtonClick('confirm')}
        disabled={isLocked || selection === null}
        state={isConfirmed ? 'selected' : !isLocked ? 'unlocked' : null}
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

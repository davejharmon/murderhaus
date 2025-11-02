import { useState } from 'react';
import { Button } from './Button';

export const Keypad = ({ onKeypress, isLocked = false }) => {
  const [selection, setSelection] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleButtonClick = (value) => {
    if (value === 'confirm') {
      setIsConfirmed(true);
    } else {
      setSelection(value);
      setIsConfirmed(false);
    }
    onKeypress?.(value);
  };

  const buttons = [...Array(9)].map((_, i) => i + 1);

  return (
    <div style={styles.keypad}>
      {buttons.map((value) => (
        <Button
          key={value}
          label={value}
          onClick={() => handleButtonClick(value)}
          disabled={isLocked}
          isActive={selection === value && !isConfirmed}
        />
      ))}
      <Button
        label='Confirm'
        onClick={() => handleButtonClick('confirm')}
        disabled={isLocked || selection === null}
        isActive={isConfirmed}
      />
    </div>
  );
};

const styles = {
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)', // 5 buttons per row
    gap: '0.5rem',
    justifyItems: 'stretch',
    width: '100%',
  },
};

import { useState } from 'react';
import { Button } from './Button';

export const Keypad = ({ onKeypress, isLocked }) => {
  const selection = useState(null);
  const isConfirmed = useState(false);
  const handleButtonClick = (value) => {
    console.log(`Button ${value} clicked`);
    onKeypress();
  };

  // Styles
  const styles = {
    keypad: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)', // 5 columns
      gridTemplateRows: 'repeat(2, 1fr)', // 2 rows
      gap: '1rem',
    },
  };

  return (
    <div style={styles.keypad}>
      {[...Array(9)].map(
        (
          _,
          index // only 8 numbers, leave last cell for confirm
        ) => (
          <Button
            key={index + 1}
            onClick={() => handleButtonClick(index + 1)}
            label={index + 1}
            disabled={isLocked}
          />
        )
      )}
      <Button
        onClick={() => handleButtonClick('confirm')}
        label='confirm'
        style={styles.confirmButton}
        disabled={isLocked}
      />
    </div>
  );
};

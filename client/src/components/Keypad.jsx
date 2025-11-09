// src/components/Keypad.jsx
import { Button } from './Button';
import { send } from '../ws';

export const Keypad = ({ player }) => {
  if (!player) return <div>Loading player...</div>;

  // Determine active actions
  const selectionAction =
    player.availableActions.find((a) => a.type === 'selection') ?? null;
  const interruptActions = player.availableActions.filter(
    (a) => a.type === 'interrupt'
  );

  // Current selection state
  const selection = selectionAction
    ? player.selections[selectionAction.name] ?? null
    : null;
  const isConfirmed = selectionAction
    ? player.confirmedSelections[selectionAction.name] ?? false
    : false;

  const handleClick = (key) => {
    // Numeric selection keys
    if (typeof key === 'number' && selectionAction) {
      const target = selection === key ? null : key;
      send('PLAYER_ACTION', {
        playerId: player.id,
        action: selectionAction.name,
        target,
      });
    }

    // Confirm button
    else if (key === 'confirm' && selectionAction && selection != null) {
      send('PLAYER_CONFIRM_ACTION', {
        playerId: player.id,
        action: selectionAction.name,
      });
    }

    // Interrupts
    else if (key === 'A' || key === 'B') {
      const idx = key === 'A' ? 0 : 1;
      const interrupt = interruptActions[idx];
      if (interrupt) {
        send('PLAYER_INTERRUPT', {
          playerId: player.id,
          action: interrupt.name,
        });
      }
    }
  };

  // Numeric buttons 1–9
  const numericButtons = Array.from({ length: 9 }, (_, i) => {
    const id = i + 1;
    const disabled =
      !selectionAction || !selectionAction.validTargets.includes(id);
    const selected = selection === id;
    return (
      <Button
        key={id}
        label={id}
        onClick={() => handleClick(id)}
        state={selected ? 'selected' : 'unlocked'}
        disabled={disabled}
      />
    );
  });

  // Last 3 buttons: A (Interrupt 1), B (Interrupt 2), C (Confirm)
  const buttonA = (
    <Button
      key='A'
      label='A'
      onClick={() => handleClick('A')}
      state={
        interruptActions[0] &&
        !player.interruptUsedMap?.[interruptActions[0].name]
          ? 'unlocked'
          : 'disabled'
      }
      disabled={
        !interruptActions[0] ||
        player.interruptUsedMap?.[interruptActions[0].name]
      }
    />
  );

  const buttonB = (
    <Button
      key='B'
      label='B'
      onClick={() => handleClick('B')}
      state={
        interruptActions[1] &&
        !player.interruptUsedMap?.[interruptActions[1].name]
          ? 'unlocked'
          : 'disabled'
      }
      disabled={
        !interruptActions[1] ||
        player.interruptUsedMap?.[interruptActions[1].name]
      }
    />
  );

  const buttonC = (
    <Button
      key='C'
      label='C'
      onClick={() => handleClick('confirm')}
      state={isConfirmed ? 'confirmed' : 'unlocked'}
      disabled={!selectionAction || selection == null || isConfirmed}
    />
  );

  return (
    <div style={styles.keypad}>
      {[...numericButtons, buttonA, buttonB, buttonC]}
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

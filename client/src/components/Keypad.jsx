// src/components/Keypad.jsx
import React from 'react';
import { Button } from './Button';
import { send } from '../ws';
import { ACTIONS, MAX_PLAYERS } from '@shared/constants';

export const Keypad = ({ player }) => {
  if (!player) return <div>Loading player...</div>;
  if (player?.availableActions?.length) {
    console.log(
      `[Keypad] Player ${player.id} availableActions:`,
      player.availableActions.map((a) => `${a.name}:${a.type}`)
    );
  }
  console.log(player);
  // Grab currently active selection action
  const selectionAction =
    player.availableActions.find((a) => a.type === 'selection') ?? null;

  const interruptActions = player.availableActions.filter(
    (a) => a.type === 'interrupt'
  );

  const selection = selectionAction
    ? player.selections[selectionAction.name] ?? null
    : null;
  const isConfirmed = selectionAction
    ? player.confirmedSelections[selectionAction.name] ?? false
    : false;

  const handleClick = (key) => {
    // Numeric selection
    if (typeof key === 'number' && selectionAction && !isConfirmed) {
      const target = selection === key ? null : key;
      send('PLAYER_SELECT', {
        playerId: player.id,
        action: selectionAction.name,
        target,
      });
    }

    // Confirm selection
    if (
      key === 'confirm' &&
      selectionAction &&
      selection != null &&
      !isConfirmed
    ) {
      send('PLAYER_CONFIRM', {
        playerId: player.id,
        action: selectionAction.name,
      });
    }

    // Interrupts
    if (key === 'A' || key === 'B') {
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
  const numericButtons = Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const id = i + 1;
    const selected = selection === id;
    const disabled = !selectionAction || isConfirmed;

    const state = selected ? 'selected' : 'unlocked';
    return (
      <Button
        key={id}
        label={id}
        onClick={() => handleClick(id)}
        state={state}
        disabled={disabled}
      />
    );
  });

  // Interrupt buttons A & B
  const interruptButton = (idx, label) => {
    const interrupt = interruptActions[idx];
    const used = interrupt ? player.interruptUsedMap?.[interrupt.name] : true;
    const disabled = !interrupt || used;
    const state = !disabled ? 'unlocked' : 'disabled';

    return (
      <Button
        key={label}
        label={label}
        onClick={() => handleClick(label)}
        state={state}
        disabled={disabled}
      />
    );
  };

  const buttonA = interruptButton(0, 'A');
  const buttonB = interruptButton(1, 'B');

  // Confirm button
  const buttonC = (
    <Button
      key='C'
      label='C'
      onClick={() => handleClick('confirm')}
      state={
        isConfirmed ? 'confirmed' : selection != null ? 'unlocked' : 'locked'
      }
      disabled={selection == null || isConfirmed}
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

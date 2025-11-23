import React, { useMemo } from 'react';
import { Button } from './Button';
import {
  EVENTS,
  HOST_ACTIONS,
  SIMULTANEOUS_PHASE_ACTIONS,
} from '@shared/constants';
import { send } from '../ws';
import styles from './HostControls.module.css';

export default function HostControls({
  players = [],
  gameMeta = {},
  buffer = {},
  active,
}) {
  const {
    gameStarted,
    phase,
    pendingEvents = [],
    activeEvents = [],
  } = gameMeta;

  /** ----------------------------
   * Host buttons for events
   * ---------------------------- */
  const hostEventButtons = useMemo(() => {
    if (SIMULTANEOUS_PHASE_ACTIONS) {
      const startAll =
        pendingEvents.length > 0
          ? {
              label: `START (${pendingEvents
                .map((e) => EVENTS[e]?.name ?? e)
                .join(', ')})`,
              onClick: () => send('START_ALL_EVENTS'),
              state: 'unlocked',
            }
          : null;

      const unresolved = activeEvents.filter((e) => !e.resolved);
      const resolveAll =
        unresolved.length > 0
          ? {
              label: `RESOLVE (${unresolved
                .map((e) => EVENTS[e.eventName]?.name ?? e.eventName)
                .join(', ')})`,
              onClick: () => send('RESOLVE_ALL_EVENTS'),
              state: 'selected',
            }
          : null;

      return [startAll, resolveAll].filter(Boolean);
    }

    // --- Default individual buttons ---
    const buttons = [];

    // Pending events → START
    pendingEvents.forEach((eventName) => {
      const active = activeEvents.some(
        (e) => e.eventName === eventName && !e.resolved
      );
      if (!active) {
        const def = EVENTS[eventName];
        buttons.push({
          eventId: null,
          eventName,
          label: `START ${def?.name ?? eventName.toUpperCase()}`,
          onClick: () =>
            send('START_EVENT', { eventName, initiatedBy: 'host' }),
          state: 'unlocked',
        });
      }
    });

    // Active events → RESOLVE
    activeEvents
      .filter((e) => !e.resolved)
      .forEach((e) => {
        const def = EVENTS[e.eventName];
        buttons.push({
          eventId: e.id,
          label: `RESOLVE ${def?.name ?? e.eventName.toUpperCase()}`,
          onClick: () => send('RESOLVE_EVENT', { eventId: e.id }),
          state: 'selected',
        });
      });

    // Resolved events → CLEAR
    activeEvents
      .filter((e) => e.resolved)
      .forEach((e) => {
        const def = EVENTS[e.eventName];
        buttons.push({
          eventId: e.id,
          eventName: e.eventName,
          label: `CLEAR ${def?.name ?? e.eventName.toUpperCase()}`,
          onClick: () => send('CLEAR_EVENT', { eventId: e.id }),
          state: 'locked',
        });
      });

    return buttons;
  }, [pendingEvents, activeEvents]);

  /** ----------------------------
   * Host actions per player
   * ---------------------------- */
  const hostActions = useMemo(() => {
    const allActions = Object.values(HOST_ACTIONS);
    return allActions.filter((action) => {
      if (!gameStarted) return action.pregame === true;
      if (!phase) return false;
      return action.phase?.includes(phase);
    });
  }, [gameStarted, phase]);

  return (
    <div className={styles.hostControls}>
      {hostEventButtons.length > 0 && (
        <div className={styles.selectionControls}>
          {hostEventButtons.map((btn, i) => (
            <Button
              key={btn.label + i}
              label={btn.label}
              onClick={btn.onClick || (() => {})}
              state={btn.state}
            />
          ))}
        </div>
      )}

      {gameStarted && (
        <div className={styles.globalControls}>
          <Button label='NEXT PHASE' onClick={() => send('NEXT_PHASE')} />
          <Button label='END GAME' onClick={() => send('END_GAME')} />
          <Button
            label='PREV SLIDE'
            onClick={() => send('SLIDE_BACK')}
            state={buffer.slideIndex > 0 ? 'default' : 'disabled'}
          />
          <Button
            label={`NEXT SLIDE (${Math.max(
              (buffer.length ?? 0) - active - 1,
              0
            )})`}
            onClick={() => send('SLIDE_NEXT')}
            state={
              (buffer.length ?? 0) - active - 1 > 0 ? 'selected' : 'disabled'
            }
          />
        </div>
      )}
    </div>
  );
}

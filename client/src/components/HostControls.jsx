import React, { useMemo } from 'react';
import { Button } from './Button';
import { HOST_CONTROLS } from '@shared/constants';
import { send } from '../ws';
import styles from './HostControls.module.css';
import { useSlides } from '../hooks/useSlides';

export default function HostControls({ game = {} }) {
  const { metaphase, activeEvents = [], availableEvents = [] } = game;
  const { buffer, active } = useSlides();

  const hostContext = useMemo(
    () => ({
      metaphase,
      buffer,
      active,
    }),
    [metaphase, buffer, active]
  );

  const hostButtons = useMemo(() => {
    return Object.values(HOST_CONTROLS).flatMap((control) => {
      // 🔹 Dynamic (fan-out) controls
      if (control.getButtons) {
        return control.getButtons(hostContext).map((btn) => ({
          id: btn.id,
          label: btn.label,
          onClick: () => {
            send(btn.send.type, btn.send.payload);
          },
        }));
      }

      // 🔹 Simple controls (existing behavior)
      if (!control.condition(hostContext)) return [];

      return [
        {
          id: control.id,
          label: control.label,
          onClick: () => send('HOST_CONTROL', { id: control.id }),
        },
      ];
    });
  }, [hostContext]);

  // /** ----------------------------
  //  * Host buttons for events
  //  * ---------------------------- */
  // const hostEventButtons = useMemo(() => {
  //   if (SIMULTANEOUS_PHASE_ACTIONS) {
  //     const startAll =
  //       pendingEvents.length > 0
  //         ? {
  //             label: `START (${pendingEvents
  //               .map((e) => EVENTS[e]?.name ?? e)
  //               .join(', ')})`,
  //             onClick: () => send('START_ALL_EVENTS'),
  //             state: 'unlocked',
  //           }
  //         : null;

  //     const unresolved = activeEvents.filter((e) => !e.resolved);
  //     const resolveAll =
  //       unresolved.length > 0
  //         ? {
  //             label: `RESOLVE (${unresolved
  //               .map((e) => EVENTS[e.eventName]?.name ?? e.eventName)
  //               .join(', ')})`,
  //             onClick: () => send('RESOLVE_ALL_EVENTS'),
  //             state: 'selected',
  //           }
  //         : null;

  //     return [startAll, resolveAll].filter(Boolean);
  //   }

  //   // --- Default individual buttons ---
  //   const buttons = [];

  //   // Pending events → START
  //   pendingEvents.forEach((eventName) => {
  //     const active = activeEvents.some(
  //       (e) => e.eventName === eventName && !e.resolved
  //     );
  //     if (!active) {
  //       const def = EVENTS[eventName];
  //       buttons.push({
  //         eventId: null,
  //         eventName,
  //         label: `START ${def?.name ?? eventName.toUpperCase()}`,
  //         onClick: () =>
  //           send('START_EVENT', { eventName, initiatedBy: 'host' }),
  //         state: 'unlocked',
  //       });
  //     }
  //   });

  //   // Active events → RESOLVE
  //   activeEvents
  //     .filter((e) => !e.resolved)
  //     .forEach((e) => {
  //       const def = EVENTS[e.eventName];
  //       buttons.push({
  //         eventId: e.id,
  //         label: `RESOLVE ${def?.name ?? e.eventName.toUpperCase()}`,
  //         onClick: () => send('RESOLVE_EVENT', { eventId: e.id }),
  //         state: 'selected',
  //       });
  //     });

  //   // Resolved events → CLEAR
  //   activeEvents
  //     .filter((e) => e.resolved)
  //     .forEach((e) => {
  //       const def = EVENTS[e.eventName];
  //       buttons.push({
  //         eventId: e.id,
  //         eventName: e.eventName,
  //         label: `CLEAR ${def?.name ?? e.eventName.toUpperCase()}`,
  //         onClick: () => send('CLEAR_EVENT', { eventId: e.id }),
  //         state: 'locked',
  //       });
  //     });

  //   return buttons;
  // }, [pendingEvents, activeEvents]);

  // /** ----------------------------
  //  * Host actions per player
  //  * ---------------------------- */
  // const hostActions = useMemo(() => {
  //   const allActions = Object.values(HOST_ACTIONS);
  //   return allActions.filter((action) => {
  //     if (!gameStarted) return action.pregame === true;
  //     if (!phase) return false;
  //     return action.phase?.includes(phase);
  //   });
  // }, [gameStarted, phase]);

  const hasEvents = activeEvents.length + availableEvents.length > 0;

  return (
    <div className={styles.hostControls}>
      <div className={styles.globalControls}>
        {hostButtons.map((btn) => (
          <Button
            key={btn.id}
            label={btn.label}
            onClick={btn.onClick}
            state='enabled'
          />
        ))}
      </div>

      {hasEvents && (
        <div className={styles.selectionControls}>
          {/* {hostEventButtons.map((btn, i) => (
            <Button
              key={btn.label + i}
              label={btn.label}
              onClick={btn.onClick || (() => {})}
              state={btn.state}
            />
          ))} */}
          <Button key={1} label={'VOTE'} /> {/* DEBUG */}
        </div>
      )}
    </div>
  );
}

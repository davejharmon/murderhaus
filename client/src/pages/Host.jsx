// src/pages/Host.jsx
import React, { useMemo } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import styles from './Host.module.css';
import { PHASES, PREGAME_HOST_ACTIONS } from '@shared/constants.js';

export default function Host() {
  const { players = [], gameMeta } = useGameState([
    'PLAYERS_UPDATE',
    'GAME_META_UPDATE',
  ]);

  const {
    phase,
    gameStarted = false,
    dayCount = 0,
    pendingEvents = [],
    currentEvents = [],
  } = gameMeta;

  // --- Host Event Buttons (START/RESOLVE/CLEAR) ---
  const hostEventButtons = useMemo(() => {
    const buttons = [];

    // 1️⃣ Pending events: show START
    pendingEvents?.forEach((actionName) => {
      const activeEvent = currentEvents?.find(
        (e) => e.action === actionName && !e.resolved
      );
      if (!activeEvent) {
        buttons.push({
          eventId: null,
          actionName,
          label: `START ${actionName.toUpperCase()}`,
          sendType: 'START_EVENT',
          state: 'unlocked',
        });
      }
    });

    // 2️⃣ Active events: show RESOLVE
    currentEvents?.forEach((event) => {
      if (!event.resolved) {
        buttons.push({
          eventId: event.id,
          actionName: event.action,
          label: `RESOLVE ${event.action.toUpperCase()}`,
          sendType: 'RESOLVE_EVENT',
          state: 'selected',
        });
      }
    });

    // 3️⃣ Resolved events: show CLEAR
    currentEvents?.forEach((event) => {
      if (event.resolved) {
        buttons.push({
          eventId: event.id,
          actionName: event.action,
          label: `CLEAR ${event.action.toUpperCase()}`,
          sendType: 'CLEAR_EVENT',
          state: 'locked',
        });
      }
    });

    return buttons;
  }, [pendingEvents, currentEvents]);

  // --- Host Actions for Player Cards ---
  const hostActions = useMemo(() => {
    if (!gameStarted) return PREGAME_HOST_ACTIONS;
    const currentPhaseObj = PHASES.find((p) => p.name === phase);
    return currentPhaseObj?.hostActions || [];
  }, [gameStarted, phase]);

  // --- Vote Selectors by Player ---
  const voteSelectorsByPlayer = useMemo(() => {
    const map = {};
    const ps = gameMeta.playersSelecting;
    if (!ps) return map;

    Object.entries(ps).forEach(([targetId, selectors]) => {
      map[targetId] = selectors.map(({ id, confirmed }) => ({
        id,
        isConfirmed: confirmed,
      }));
    });

    return map;
  }, [gameMeta]);

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <h2>
            {gameStarted
              ? `DAY ${dayCount}, PHASE: ${phase || 'Unknown'}`
              : 'GAME NOT STARTED'}
          </h2>
        </header>

        <section className={styles.controls}>
          {!gameStarted ? (
            <Button label='START GAME' onClick={() => send('START_GAME')} />
          ) : (
            <div className={styles.globalControls}>
              <Button
                label='NEXT PHASE'
                onClick={() => send('NEXT_PHASE')}
                isNext
              />
              <Button
                label='END GAME'
                onClick={() => send('END_GAME')}
                state='selected'
              />
            </div>
          )}

          {hostEventButtons.length > 0 && (
            <div className={styles.selectionControls}>
              {hostEventButtons.map(
                ({ eventId, actionName, label, sendType, state }) => (
                  <Button
                    key={eventId || label}
                    label={label}
                    onClick={() => {
                      if (sendType === 'START_EVENT') {
                        send(sendType, { actionName });
                      } else {
                        send(sendType, { eventId });
                      }
                    }}
                    state={state}
                  />
                )
              )}
            </div>
          )}
        </section>

        <section className={styles.playersSection}>
          <div className={styles.playerList}>
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                actions={hostActions.map((actionName) => ({
                  label: actionName.toUpperCase(),
                  action: () =>
                    send('HOST_ACTION', { playerId: p.id, actionName }),
                }))}
                variant='light'
                voteSelectors={voteSelectorsByPlayer[p.id] || []}
              />
            ))}
          </div>
        </section>
      </div>

      <div className={styles.rightColumn}>
        <History />
      </div>
    </div>
  );
}

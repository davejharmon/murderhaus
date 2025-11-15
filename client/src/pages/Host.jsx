// src/pages/Host.jsx
import React, { useMemo } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import styles from './Host.module.css';

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

  const hostEventButtons = useMemo(() => {
    if (!gameStarted) return [];

    const buttons = [];

    // 1️⃣ Pending events: show START
    pendingEvents?.forEach((actionName) => {
      const activeEvent = currentEvents?.find(
        (e) => e.action === actionName && !e.resolved
      );
      if (!activeEvent) {
        buttons.push({
          eventId: null, // not started yet, no ID
          actionName,
          label: `START ${actionName.toUpperCase()}`,
          sendType: 'START_EVENT',
          state: 'unlocked',
        });
      }
    });

    // 2️⃣ Active current events: show RESOLVE
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
    console.log(gameMeta);
    return buttons;
  }, [gameStarted, pendingEvents, currentEvents]);

  // --- Vote Selectors by Player ---
  const voteSelectorsByPlayer = useMemo(() => {
    const map = {};
    players.forEach((target) => {
      const selectors = players
        .map((p) => {
          if (!p.selections || !p.confirmedSelections) return null;

          const isConfirmed = Object.entries(p.confirmedSelections).some(
            ([_, val]) => val === target.id
          );
          const isSelected = Object.entries(p.selections).some(
            ([_, val]) => val === target.id
          );

          return isSelected ? { id: p.id, isConfirmed } : null;
        })
        .filter(Boolean);

      map[target.id] = selectors;
    });
    return map;
  }, [players]);

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
                    key={eventId || label} // fallback for pending events without ID
                    label={label}
                    onClick={() => {
                      if (sendType === 'START_EVENT') {
                        send(sendType, { actionName }); // START uses actionName
                      } else {
                        send(sendType, { eventId }); // RESOLVE/CLEAR use eventId
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
                actions={(p.hostActions || []).map((actionName) => ({
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

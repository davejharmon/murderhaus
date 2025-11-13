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

  // --- Host Event Buttons ---
  const hostEventButtons = useMemo(() => {
    if (!gameStarted || !pendingEvents?.length) return [];

    return pendingEvents.map((actionName) => {
      const activeEvent = currentEvents?.find(
        (e) => e.action === actionName && !e.resolved
      );

      return {
        actionName,
        isActive: !!activeEvent,
        label: `${
          activeEvent ? 'RESOLVE' : 'START'
        } ${actionName.toUpperCase()}`,
        sendType: activeEvent ? 'RESOLVE_EVENT' : 'START_EVENT',
      };
    });
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
          <h1>{pendingEvents}</h1>
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
                ({ actionName, label, sendType, isActive }) => (
                  <Button
                    key={actionName}
                    label={label}
                    onClick={() => send(sendType, { actionName })}
                    state={isActive ? 'selected' : 'unlocked'}
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
                    send('HOST_ACTION', { playerId: p.id, action: actionName }),
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

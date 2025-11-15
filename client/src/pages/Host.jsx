// src/pages/Host.jsx
import React, { useMemo } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import styles from './Host.module.css';
import { ACTIONS, HOST_ACTIONS } from '../../../shared/constants';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Host() {
  const { players = [], gameMeta } = useGameState([
    'PLAYERS_UPDATE',
    'GAME_META_UPDATE',
  ]);
  usePageTitle('Host');
  const {
    phase,
    gameStarted = false,
    dayCount = 0,
    pendingEvents = [],
    currentEvents = [],
  } = gameMeta;

  const hostEventButtons = useMemo(() => {
    const buttons = [];

    // --- 1️⃣ START buttons for pending events ---
    pendingEvents?.forEach((actionName) => {
      const def = ACTIONS[actionName];
      const active = currentEvents?.some(
        (e) => e.action === actionName && !e.resolved
      );

      if (!active) {
        buttons.push({
          eventId: null,
          actionName,
          label: `START ${def?.label ?? actionName.toUpperCase()}`,
          sendType: 'START_EVENT',
          state: 'unlocked',
        });
      }
    });

    // --- 2️⃣ Active events → RESOLVE buttons ---
    currentEvents
      ?.filter((e) => !e.resolved)
      .forEach((e) => {
        const def = ACTIONS[e.action];
        buttons.push({
          eventId: e.id,
          actionName: e.action,
          label: `RESOLVE ${def?.label ?? e.action.toUpperCase()}`,
          sendType: 'RESOLVE_EVENT',
          state: 'selected',
        });
      });

    // --- 3️⃣ Resolved events → CLEAR buttons ---
    currentEvents
      ?.filter((e) => e.resolved)
      .forEach((e) => {
        const def = ACTIONS[e.action];
        buttons.push({
          eventId: e.id,
          actionName: e.action,
          label: `CLEAR ${def?.label ?? e.action.toUpperCase()}`,
          sendType: 'CLEAR_EVENT',
          state: 'locked',
        });
      });

    return buttons;
  }, [pendingEvents, currentEvents]);

  const hostActions = useMemo(() => {
    // Collect all actions from HOST_ACTIONS object
    const all = Object.values(HOST_ACTIONS);

    return all.filter((action) => {
      if (!gameStarted) {
        // Pregame: only include actions flagged for pregame
        return action.pregame === true;
      }

      // In-game: match phase AND allow non-pregame actions
      if (!phase) return false;
      return action.phase?.includes(phase);
    });
  }, [gameStarted, phase]);

  // --- Vote Selectors by Player ---
  const voteSelectorsByPlayer = useMemo(() => {
    const map = {};
    const ps = gameMeta.playersSelecting;
    if (!ps) return map;

    Object.entries(ps).forEach(([targetId, selectors]) => {
      map[targetId] = selectors.map(({ id, confirmed }) => {
        const player = players.find((p) => p.id === id);
        return {
          id,
          isConfirmed: confirmed,
          col: player?.color || '#000', // fallback to black
        };
      });
    });

    return map;
  }, [gameMeta, players]);

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
            {players.map((p) => {
              // Determine which host actions are available for this player
              const availableActions = hostActions.filter((action) =>
                action.conditions({ player: p, game: gameMeta })
              );

              return (
                <PlayerCard
                  key={p.id}
                  player={p}
                  actions={availableActions.map((action) => ({
                    label: action.label,
                    action: () =>
                      send('HOST_ACTION', {
                        playerId: p.id,
                        actionName: action.name,
                      }),
                  }))}
                  variant='light'
                  voteSelectors={voteSelectorsByPlayer[p.id] || []}
                  phase={phase}
                />
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.rightColumn}>
        <History />
      </div>
    </div>
  );
}

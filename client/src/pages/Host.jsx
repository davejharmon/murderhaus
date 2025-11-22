// src/pages/Host.jsx
import React, { useMemo } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import styles from './Host.module.css';
import { EVENTS, HOST_ACTIONS } from '@shared/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSlides } from '../hooks/useSlides';

export default function Host() {
  const { players = [], gameMeta } = useGameState([
    'PLAYERS_UPDATE',
    'GAME_META_UPDATE',
  ]);
  const { active, buffer } = useSlides();
  usePageTitle('Host');

  const {
    phase,
    gameStarted = false,
    dayCount = 0,
    pendingEvents = [], // comes from server (EventManager.buildPendingEvents)
    activeEvents = [], // active events list
  } = gameMeta;

  /** ----------------------------
   * Host buttons for events
   * ---------------------------- */
  /** ----------------------------
   * Host buttons for events (refactored)
   * ---------------------------- */
  const hostEventButtons = useMemo(() => {
    const buttons = [];

    // 1️⃣ Pending events → START
    pendingEvents?.forEach((eventName) => {
      const active = activeEvents?.some(
        (e) => e.eventName === eventName && !e.resolved
      );
      if (!active) {
        const def = EVENTS[eventName];
        buttons.push({
          eventId: null,
          eventName,
          label: `START ${def?.label ?? eventName.toUpperCase()}`,
          sendType: 'START_EVENT',
          state: 'unlocked',
        });
      }
    });

    // 2️⃣ Active events → RESOLVE
    activeEvents
      ?.filter((e) => !e.resolved)
      .forEach((e) => {
        const def = EVENTS[e.eventName];
        buttons.push({
          eventId: e.id,
          eventName: e.eventName,
          label: `RESOLVE ${def?.label ?? e.eventName.toUpperCase()}`,
          sendType: 'RESOLVE_EVENT',
          state: 'selected',
        });
      });

    // 3️⃣ Resolved events → CLEAR
    activeEvents
      ?.filter((e) => e.resolved)
      .forEach((e) => {
        const def = EVENTS[e.eventName];
        buttons.push({
          eventId: e.id,
          eventName: e.eventName,
          label: `CLEAR ${def?.label ?? e.eventName.toUpperCase()}`,
          sendType: 'CLEAR_EVENT',
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

  /** ----------------------------
   * Vote selectors mapping
   * ---------------------------- */
  const selectionGlyphs = useMemo(() => {
    const map = {};

    // Find the active vote event (unresolved)
    const voteEvent = activeEvents?.find(
      (e) => e.eventName === 'vote' && !e.resolved
    );

    if (!voteEvent) return map;

    const { results = {}, completedBy = [] } = voteEvent;

    // Build mapping target → list of selectors
    Object.entries(results).forEach(([actorId, targetId]) => {
      const actor = players.find((p) => p.id === Number(actorId));
      if (!actor) return;

      if (!map[targetId]) map[targetId] = [];

      map[targetId].push({
        id: actor.id,
        isConfirmed: completedBy.includes(actor.id),
        col: actor.color,
      });
    });

    return map;
  }, [activeEvents, players]);

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
              <Button label='NEXT PHASE' onClick={() => send('NEXT_PHASE')} />
              <Button label='END GAME' onClick={() => send('END_GAME')} />
              <Button
                label='PREV SLIDE'
                onClick={() => send('SLIDE_BACK')}
                state={buffer.slideIndex > 0 ? 'default' : 'disabled'}
              />
              <Button
                label={`NEXT SLIDE (${buffer.length ?? 0})`}
                onClick={() => send('SLIDE_NEXT')}
                state={buffer.length > 0 ? 'selected' : 'disabled'}
              />
            </div>
          )}

          {hostEventButtons.length > 0 && (
            <div className={styles.selectionControls}>
              {hostEventButtons.map(
                ({ eventId, eventName, label, sendType, state }) => (
                  <Button
                    key={eventId || label}
                    label={label}
                    onClick={() => {
                      if (sendType === 'START_EVENT') {
                        send(sendType, { eventName });
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
                  selectionGlyphs={selectionGlyphs[p.id] || []}
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

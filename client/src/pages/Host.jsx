// src/pages/Host.jsx
import React, { useMemo, useState } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import Modal from '../components/Modal';
import styles from './Host.module.css';
import { EVENTS, HOST_ACTIONS } from '@shared/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSlides } from '../hooks/useSlides';
import HostControls from '../components/HostControls';
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
    pendingEvents = [],
    activeEvents = [],
  } = gameMeta;

  // Modal state
  const [modalPlayer, setModalPlayer] = useState(null);
  const [modalSelection, setModalSelection] = useState(null);

  // All static player portraits
  const playerPortraits = useMemo(() => {
    return Array.from(
      { length: 9 },
      (_, i) => `/images/players/player${i + 1}.png`
    );
  }, []);

  // Confirm portrait selection
  const handleConfirmPortrait = () => {
    if (modalPlayer && modalSelection) {
      send('HOST_UPDATE_PLAYER_IMAGE', {
        id: modalPlayer.id,
        image: modalSelection.replace('/images/players/', ''),
      });
      setModalPlayer(null);
      setModalSelection(null);
    }
  };

  /** ----------------------------
   * Host buttons for events
   * ---------------------------- */
  const hostEventButtons = useMemo(() => {
    const buttons = [];

    // Pending events → START
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

    // Active events → RESOLVE
    activeEvents
      ?.filter((e) => !e.resolved)
      .forEach((e) => {
        const def = EVENTS[e.eventName];
        buttons.push({
          eventId: e.id,
          label: `RESOLVE ${def?.label ?? e.eventName.toUpperCase()}`,
          sendType: 'RESOLVE_EVENT',
          state: 'selected',
        });
      });

    // Resolved events → CLEAR
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

    // Loop through all active events that contain results
    activeEvents
      ?.filter((e) => e.results) // or any condition you want (e.eventName === "vote"...)
      .forEach((event) => {
        const { results = {}, completedBy = [] } = event;

        Object.entries(results).forEach(([actorId, targetId]) => {
          const actor = players.find((p) => p.id === Number(actorId));
          if (!actor) return;

          if (!map[targetId]) map[targetId] = [];

          map[targetId].push({
            id: actor.id,
            isConfirmed: completedBy.includes(actor.id),
            col: actor.color,
            eventName: event.eventName, // optional: include source event
            eventId: event.id, // optional: include event ID for debugging
          });
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

          {/* Active Events List */}
          {activeEvents.length > 0 && (
            <div className={styles.activeEventsList}>
              <ul>
                {activeEvents.map((e) => (
                  <span key={e.id}>
                    {e.eventName} {e.resolved ? '(Resolved)' : '(Pending)'}
                  </span>
                ))}
              </ul>
            </div>
          )}
        </header>

        <section className={styles.controls}>
          {!gameStarted ? (
            <Button label='START GAME' onClick={() => send('START_GAME')} />
          ) : (
            <HostControls
              players={players}
              gameMeta={gameMeta}
              buffer={buffer}
              active={active}
            />
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
                  onPortraitClick={() => setModalPlayer(p)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.rightColumn}>
        <History />
      </div>

      {/* Player Portrait Modal */}
      <Modal isOpen={!!modalPlayer} onClose={() => setModalPlayer(null)}>
        <h2>Select Portrait for {modalPlayer?.name}</h2>
        <div className={styles.portraitGallery}>
          {playerPortraits.map((src) => (
            <img
              key={src}
              src={src}
              alt=''
              className={`${styles.modalPortrait} ${
                modalSelection === src ? styles.selected : ''
              }`}
              onClick={() => setModalSelection(src)}
            />
          ))}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Button label='Confirm' onClick={handleConfirmPortrait} />
          <Button label='Cancel' onClick={() => setModalPlayer(null)} />
        </div>
      </Modal>
    </div>
  );
}

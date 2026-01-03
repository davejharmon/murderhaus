// src/pages/Host.jsx
import { useMemo, useState } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { useGameState } from '../hooks/useGameState';
import History from '../components/History';
import Modal from '../components/Modal';
import styles from './Host.module.css';
import { usePageTitle } from '../hooks/usePageTitle';
import HostControls from '../components/HostControls';
export default function Host() {
  // game state
  const { wsStatus, game } = useGameState();
  usePageTitle('Host');
  const {
    phase,
    metaphase,
    gameStarted,
    dayCount,
    players = [],
    activeEvents = [],
    availableEvents = [],
  } = game;

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
   * Vote selectors mapping
   * ---------------------------- */
  // const selectionGlyphs = useMemo(() => {
  //   const map = {};

  //   // Loop through all active events that contain results
  //   activeEvents
  //     ?.filter((e) => e.results) // or any condition you want (e.eventName === "vote"...)
  //     .forEach((event) => {
  //       const { results = {}, completedBy = [] } = event;

  //       Object.entries(results).forEach(([actorId, targetId]) => {
  //         const actor = players.find((p) => p.id === Number(actorId));
  //         if (!actor) return;

  //         if (!map[targetId]) map[targetId] = [];

  //         map[targetId].push({
  //           id: actor.id,
  //           isConfirmed: completedBy.includes(actor.id),
  //           col: actor.color,
  //           eventName: event.eventName, // optional: include source event
  //           eventId: event.id, // optional: include event ID for debugging
  //         });
  //       });
  //     });

  //   return map;
  // }, [activeEvents, players]);
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
          <HostControls
            metaphase={metaphase}
            activeEvents={activeEvents}
            availableEvents={availableEvents}
          />
        </section>

        <section className={styles.playersSection}>
          <div className={styles.playerList}>
            {players.map((p) => {
              const hostActionButtons = p.availableActions.map((action) => ({
                label: action, // get this from defs
                handler: () => {
                  send('HOST_ACTION', {
                    playerId: p.id,
                    actionName: action,
                  });
                },
              }));

              return (
                <PlayerCard
                  key={p.id}
                  player={p}
                  hostActionButtons={hostActionButtons}
                  // selectionGlyphs={selectionGlyphs[p.id] || []}
                  phase={phase}
                  metaphase={metaphase}
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

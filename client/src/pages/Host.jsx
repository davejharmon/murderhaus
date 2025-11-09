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

  const { phase, gameStarted = false, dayCount = 0 } = gameMeta;

  // Compute vote selectors for each player
  const voteSelectorsByPlayer = useMemo(() => {
    const map = {};
    players.forEach((target) => {
      const selectors = players
        .map((p) => {
          if (!p.selections || !p.confirmedSelections) return null;

          const confirmed = Object.entries(p.confirmedSelections).some(
            ([action, val]) => val === target.id
          );
          const selected = Object.entries(p.selections).some(
            ([action, val]) => val === target.id
          );

          return selected ? { id: p.id, isConfirmed: confirmed } : null;
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
          <h1>Host Dashboard</h1>
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

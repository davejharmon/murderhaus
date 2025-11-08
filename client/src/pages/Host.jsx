// src/pages/Host.jsx
import React, { useMemo } from 'react';
import { send } from '../ws';
import { Button } from '../components/Button';
import { PlayerRow } from '../components/PlayerRow';
import styles from './Host.module.css';

// Memoized log entry
const LogEntry = React.memo(({ entry }) => {
  const { message, type = 'system', timestamp } = entry;
  const typeColors = {
    system: '#999',
    player: '#999',
    murder: '#d32f2f',
    default: '#333',
  };
  const color = typeColors[type] || typeColors.default;
  const ts = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li style={{ color }}>
      [{ts}] {message}
    </li>
  );
});

export default function Host({ gameState }) {
  const players = gameState?.players?.filter(Boolean) || [];
  const gameStarted = gameState?.gameStarted ?? false;
  const dayCount = gameState?.dayCount ?? null;
  const phase = gameState?.phase ?? null;
  const log = gameState?.log ?? [];

  // Memoize vote selectors
  const voteSelectorsByPlayer = useMemo(() => {
    const map = {};
    players.forEach((target) => {
      map[target.id] = players
        .filter((p) => p.selections?.[0] === target.id)
        .map((p) => ({
          id: p.id,
          isConfirmed: p.confirmedSelections?.includes(target.id),
        }));
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
              ? `DAY ${dayCount}, PHASE: ${phase}`
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
                onClick={() => alert('End Game not implemented yet')}
                state='selected'
              />
            </div>
          )}
        </section>

        <section className={styles.playersSection}>
          <div className={styles.playerList}>
            {players.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                actions={p.hostActions.map((actionName) => ({
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
        <div className={styles.historyHeader}>
          <h3>History</h3>
        </div>

        <ul className={styles.historyList}>
          {log.map((entry, i) => (
            <LogEntry key={i} entry={entry} />
          ))}
        </ul>
      </div>
    </div>
  );
}

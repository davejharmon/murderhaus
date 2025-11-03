import { useState, useEffect } from 'react';
import { connect, subscribe, subscribeStatus, send } from '../ws';
import { Button } from '../components/Button';
import { PHASES, PHASE_DESCRIPTIONS } from '@shared/constants';
import { PlayerRow } from '../components/PlayerRow';
import { PhaseManager } from '../models/PhaseManager';
import styles from './Host.module.css';

export default function Host() {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] = useState({
    day: null,
    phase: null,
    history: [],
  });

  useEffect(() => {
    connect();

    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE' && msg.payload) {
        const { players: pl = [], day, phase, history = [] } = msg.payload;
        setPlayers(pl.filter(Boolean));
        setGameInfo({ day, phase, history });
      }
    });

    const unsubStatus = subscribeStatus(setWsStatus);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);
  const gameStarted = !!(gameInfo.day && gameInfo.phase);

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <header className={styles.header}>
          <h1>Host Dashboard</h1>
          <h2>
            {gameStarted
              ? `DAY ${gameInfo.day}, PHASE: ${gameInfo.phase}`
              : 'GAME NOT STARTED'}
          </h2>
          <p className={styles.phaseDescription}>
            {gameStarted && PHASE_DESCRIPTIONS[gameInfo.phase]}
          </p>
        </header>

        <section className={styles.controls}>
          {!gameStarted ? (
            <Button label='START GAME' onClick={() => send('START_GAME')} />
          ) : (
            <>
              <div className={styles.phaseButtons}>
                {PHASES.map((phase) => (
                  <Button
                    key={phase}
                    label={phase}
                    onClick={() => send('SET_PHASE', { phase })}
                    isActive={gameInfo.phase === phase}
                  />
                ))}
              </div>
              <div className={styles.globalControls}>
                <Button label='NEXT' onClick={() => send('SET_PHASE')} isNext />
                <Button
                  label='END GAME'
                  onClick={() => send('END_GAME')}
                  variant='danger'
                />
              </div>
            </>
          )}
        </section>

        <section className={styles.playersSection}>
          <h2>Players</h2>
          <div className={styles.playerList}>
            {players.map((p) => {
              // Dynamic host options
              const hostOptions =
                PhaseManager.getHostOptions(gameInfo.phase, p) || [];

              const actions = hostOptions.map((opt) => ({
                label: opt.label,
                action: () => opt.action(p.id, send),
              }));

              return (
                <PlayerRow
                  key={p.id}
                  player={p}
                  actions={actions}
                  variant='light'
                />
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.historyHeader}>
          <h3>History</h3>
          <Button
            label='Clear'
            onClick={() => setGameInfo((prev) => ({ ...prev, history: [] }))}
          />
        </div>
        <ul className={styles.historyList}>
          {gameInfo.history.map((entry, i) => {
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
              <li key={i} style={{ color }}>
                [{ts}] {message}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

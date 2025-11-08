import { useState, useEffect } from 'react';
import { connect, subscribe, subscribeStatus, send } from '../ws';
import { PHASES } from '@shared/constants';
import { PlayerRow } from '../components/PlayerRow';
import { Button } from '../components/Button';
import styles from './Host.module.css';

export default function Host() {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] = useState({
    day: null,
    phase: null,
    activeEvent: null,
    history: [],
  });

  useEffect(() => {
    connect();

    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE' && msg.payload) {
        const { players: pl = [], day, phase, history = [] } = msg.payload;

        const gameStarted = !!(day && phase);

        const playersWithHostActions = pl.map((p) => {
          const hostActions = [];

          // Kick always
          hostActions.push({
            label: 'Kick',
            action: () => send('KILL_PLAYER', { playerId: p.id }),
          });

          // Before game start: Assign Role
          if (!gameStarted) {
            hostActions.push({
              label: 'Assign Role',
              action: () => {
                const role = prompt(`Assign role to ${p.name} (${p.id}):`);
                if (role) send('ASSIGN_ROLE', { playerId: p.id, role });
              },
            });
          } else {
            // After game start: Kill/Revive
            hostActions.push({
              label: p.isAlive ? 'Kill' : 'Revive',
              action: () =>
                send(p.isAlive ? 'KILL_PLAYER' : 'REVIVE_PLAYER', {
                  playerId: p.id,
                }),
            });
          }

          return { ...p, hostActions };
        });

        setPlayers(playersWithHostActions);
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
      <header>
        <h1>Host Dashboard</h1>
        <h2>
          {gameStarted
            ? `Day ${gameInfo.day} | Phase: ${gameInfo.phase}`
            : 'Game Not Started'}
        </h2>
      </header>

      <section className={styles.controls}>
        {!gameStarted ? (
          <Button label='START GAME' onClick={() => send('START_GAME')} />
        ) : (
          <>
            <div className={styles.phaseButtons}>
              {PHASES.map((p) => (
                <Button
                  key={p.name}
                  label={p.name}
                  state={gameInfo.phase === p.name ? 'selected' : 'unselected'}
                  onClick={() => send('SET_PHASE', { phase: p.name })}
                />
              ))}
            </div>

            <Button label='END GAME' onClick={() => send('END_GAME')} />
            <Button
              label='RESOLVE PHASE'
              onClick={() => send('RESOLVE_PHASE')}
            />
          </>
        )}
      </section>

      <section className={styles.playersSection}>
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} actions={p.hostActions} />
        ))}
      </section>

      <section className={styles.history}>
        <h3>History</h3>
        <ul>
          {gameInfo.history.map((h, i) => (
            <li key={i}>{h.message}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

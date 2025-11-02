import { useState, useEffect } from 'react';
import { connect, subscribe, subscribeStatus, send } from '../ws';
import { Button } from '../components/Button';
import { PHASES, PHASE_DESCRIPTIONS } from '../../../shared/constants';
import { PlayerRow } from '../components/PlayerRow';

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
        setPlayers(pl.filter(Boolean)); // remove nulls
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
    <div style={styles.container}>
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h1>Host Dashboard</h1>
          <h2>
            {gameStarted
              ? `DAY ${gameInfo.day}, PHASE: ${gameInfo.phase}`
              : 'GAME NOT STARTED'}
          </h2>
          <p style={styles.phaseDescription}>
            {gameStarted && PHASE_DESCRIPTIONS[gameInfo.phase]}
          </p>
        </header>

        <section style={styles.controls}>
          {!gameStarted ? (
            <Button label='START GAME' onClick={() => send('START_GAME')} />
          ) : (
            <>
              <div style={styles.phaseButtons}>
                {PHASES.map((phase) => (
                  <Button
                    key={phase}
                    label={phase}
                    onClick={() => send('SET_PHASE', { phase })}
                    isActive={gameInfo.phase === phase}
                  />
                ))}
              </div>
              <div style={styles.globalControls}>
                <Button label='NEXT' onClick={() => send('SET_PHASE')} isNext />
              </div>
            </>
          )}
        </section>

        <section style={styles.playersSection}>
          <h2>Players</h2>
          <div style={styles.playerList}>
            {players.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </div>
        </section>
      </div>

      <div style={styles.rightColumn}>
        <h3>History</h3>
        <ul style={styles.historyList}>
          {gameInfo.history.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: 'sans-serif',
    gap: '1rem',
    padding: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#f5f5f5',
  },
  leftColumn: {
    flex: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
  },
  rightColumn: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
  },
  header: { textAlign: 'center' },
  phaseDescription: {
    marginTop: '0.25rem',
    fontStyle: 'italic',
    color: '#555',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  phaseButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  playersSection: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  playerList: { display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' },
  globalControls: { display: 'flex', justifyContent: 'center', gap: '1rem' },
  historyList: { listStyle: 'none', fontSize: '0.8rem', padding: 0, margin: 0 },
};

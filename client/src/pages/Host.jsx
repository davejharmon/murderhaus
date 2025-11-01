// src/pages/Host.jsx
import { useState, useEffect } from 'react';
import { connect, send } from '../ws';
import { Button } from '../components/Button';
import { PHASES, PHASE_DESCRIPTIONS } from '../../../shared/constants';
import { NumberEmoji } from '../components/NumberEmoji';
import { Bulb } from '../components/Bulb';
import { PlayerName } from '../components/PlayerName';
import { PlayerRow } from '../components/PlayerRow';

export default function Host() {
  const [gameState, setGameState] = useState(null);
  const DEBUG = false; // toggle to true to show debug info

  useEffect(() => connect(setGameState), []);

  if (!gameState) return <div>Connecting...</div>;

  const gameStarted = !!(gameState?.day && gameState?.phase);

  return (
    <div style={styles.container}>
      {/* Left Column */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h1>Host Dashboard</h1>
          <h2>
            {gameStarted
              ? `DAY ${gameState.day}, PHASE: ${gameState.phase}`
              : 'GAME NOT STARTED'}
          </h2>
          {gameStarted && (
            <p style={styles.phaseDescription}>
              {PHASE_DESCRIPTIONS[gameState.phase]}
            </p>
          )}
        </header>

        {/* Controls */}
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
                    isActive={gameState.phase === phase}
                  />
                ))}
              </div>
              <div style={styles.globalControls}>
                <Button label='NEXT' onClick={() => send('SET_PHASE')} isNext />
              </div>
            </>
          )}
        </section>

        {/* Players list */}
        <section style={styles.playersSection}>
          <h2>Players</h2>
          <div style={styles.playerList}>
            {gameState.players.map((p, i) => (
              <PlayerRow
                key={p?.id ?? i} // fallback key
                player={p}
                gameState={gameState}
                setGameState={setGameState}
                DEBUG={DEBUG}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Right Column - History */}
      <div style={styles.rightColumn}>
        <h3>History</h3>
        <ul style={styles.historyList}>
          {gameState.history.map((h, i) => (
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
  },
  leftColumn: {
    flex: '4',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  rightColumn: {
    flex: '1',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  header: { textAlign: 'center' },
  phaseDescription: {
    marginTop: '0.25rem',
    fontSize: '1rem',
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
  playerRow: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '0.5rem',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.2rem',
    fontWeight: '500',
  },
  playerName: { fontWeight: 'bold' },
  playerRole: { color: 'blue' },
  playerActions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  globalControls: { display: 'flex', justifyContent: 'center', gap: '1rem' },
  debugLine: { fontSize: '0.8em', color: 'gray', marginTop: '4px' },
  historyList: { listStyle: 'none', fontSize: '0.8rem', padding: 0, margin: 0 },
};

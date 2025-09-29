import { useState, useEffect } from 'react';
import { connect, send } from '../ws';
import { Button } from '../components/Button';
import { PHASES } from '../../../shared/constants';
import { NumberEmoji } from '../components/NumberEmoji';
import { Bulb } from '../components/Bulb';
export default function Host() {
  const [gameState, setGameState] = useState(null);

  useEffect(() => connect(setGameState), []);

  if (!gameState) return <div>Connecting...</div>;

  return (
    <div style={styles.container}>
      {/* Left Column */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h1>Host Dashboard</h1>
          <h2>
            {gameState.phase !== 'lobby' && <span>Day {gameState.day}, </span>}
            {gameState.phase}
          </h2>
        </header>

        {/* Phase buttons */}
        <div style={styles.phaseButtons}>
          {PHASES.map((phase) => (
            <Button
              key={phase}
              label={phase}
              onClick={() => send('SET_PHASE', { phase })}
              isActive={gameState.phase === phase} // <-- active styling
            />
          ))}
        </div>

        {/* Players list */}
        <section style={styles.playersSection}>
          <h2>Players</h2>
          <div style={styles.playerList}>
            {gameState.players
              .filter((p) => p)
              .map((p, i) => (
                <div key={p.id} style={styles.playerRow}>
                  <div style={styles.playerInfo}>
                    <Bulb player={p} phase={gameState.phase} />
                    <span style={styles.playerBulb}>
                      <NumberEmoji number={p.id} />
                    </span>
                    <span style={styles.playerName}>{p.name}</span>
                    <span style={styles.playerRole}>{p.role}</span>
                  </div>
                  <div style={styles.playerActions}>
                    <Button label='KILL' />
                    <Button label='REVEAL' />
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Global controls */}
        <section style={styles.globalControls}>
          <Button label='NEXT' onClick={() => send('SET_PHASE')} />
          <Button label='...' />
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
  header: {
    textAlign: 'center',
  },
  phaseButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  playersSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  playerList: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.5rem',
  },
  playerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  playerId: {
    fontSize: '1.5rem',
  },
  playerName: {
    fontWeight: 'bold',
  },
  playerRole: {
    color: 'blue',
  },
  playerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  globalControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  historyList: {
    listStyle: 'none',
    fontSize: '0.8rem',
    padding: 0,
    margin: 0,
  },
};

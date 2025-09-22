import { useState, useEffect } from 'react';
import { connect, send } from '../ws';

export default function Host() {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    connect(setGameState);
  }, []);

  if (!gameState) return <div>Connecting...</div>;

  return (
    <div>
      <h1>Host Controller</h1>

      <div>
        <button onClick={() => send('SET_PHASE', { phase: 'day' })}>
          Start Day
        </button>
        <button onClick={() => send('SET_PHASE', { phase: 'night' })}>
          Start Night
        </button>
        <button onClick={() => send('SET_PHASE', { phase: 'voting' })}>
          Start Voting
        </button>
        <button onClick={() => send('TALLY_VOTES')}>Tally Votes</button>
      </div>

      <h2>Current Phase: {gameState.phase}</h2>

      <h3>Players:</h3>
      <ul>
        {Object.values(gameState.players).map((p) => (
          <li key={p.id}>
            {p.name} — {p.alive ? 'Alive' : 'Eliminated'}
          </li>
        ))}
      </ul>

      <h3>History:</h3>
      <ul>
        {gameState.history.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

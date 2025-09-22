import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send } from '../ws';

export default function Player() {
  const { id } = useParams(); // player ID from URL
  const [gameState, setGameState] = useState(null);
  const [selection, setSelection] = useState(null);

  const registeredRef = useRef(false); // track if we've already registered

  useEffect(() => {
    // Single connection on mount
    connect((state) => {
      setGameState(state);

      // Register player once
      if (!registeredRef.current) {
        send('REGISTER_PLAYER', { id, name: `Player ${id}` });
        registeredRef.current = true;
      }
    });
  }, [id]);

  if (!gameState) return <div>Connecting...</div>;

  const me = gameState.players[id];
  if (!me) return <div>Unknown player {id}</div>;

  function handleSelect(targetId) {
    setSelection(targetId);
  }

  function handleConfirm() {
    if (selection !== null) {
      send('CAST_VOTE', { voterId: id, targetId: selection });
      setSelection(null);
    }
  }

  return (
    <div>
      <h1>{me.name}</h1>

      {/* Bulb indicator */}
      <div>{me.alive ? '● Alive' : '● Eliminated'}</div>

      {me.alive ? (
        <>
          <h2>Vote</h2>
          <div>
            {Object.values(gameState.players)
              .filter((p) => p.id !== id && p.alive)
              .map((p) => (
                <button key={p.id} onClick={() => handleSelect(p.id)}>
                  {selection === p.id ? `✔ ${p.name}` : p.name}
                </button>
              ))}
          </div>

          <button onClick={handleConfirm} disabled={selection === null}>
            Confirm Vote
          </button>
        </>
      ) : (
        <p>You are eliminated</p>
      )}
    </div>
  );
}

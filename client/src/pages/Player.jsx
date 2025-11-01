import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send } from '../ws';
import { Keypad } from '../components/Keypad';
import { Bulb } from '../components/Bulb';

export default function Player() {
  const { id } = useParams();
  const index = Number(id);
  const [gameState, setGameState] = useState(null);

  // Connect to WS
  useEffect(() => connect(setGameState), []);

  // Register player on first available
  useEffect(() => {
    if (!gameState) return;
    if (!gameState.players[index]) {
      send('REGISTER_PLAYER', { id: index });
    }
  }, [gameState, index]);

  if (!gameState) return <div>Loading...</div>;

  const onKeypress = () => {
    console.log(`Key was pressed`);
  };

  const me = gameState.players[index];
  if (!me) return <div>Registering Player {index}...</div>;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows: 'auto auto 1fr',
          gap: '1rem',
          maxWidth: '800px', // prevent grid from stretching too wide
          width: '100%',
        }}
      >
        {/* Big number */}
        <div
          style={{
            gridArea: '1 / 1 / 3 / 2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(3rem, 15vw, 10rem)',
            fontWeight: 'bold',
          }}
        >
          {me.id}
        </div>

        {/* Name */}
        <div
          style={{
            gridArea: '1 / 2 / 2 / 3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(1rem, 4vw, 2rem)',
            fontWeight: '500',
          }}
        >
          {me.name}
        </div>

        {/* Role */}
        <div
          style={{
            gridArea: '2 / 2 / 3 / 3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            fontWeight: 'bold',
          }}
        >
          {me.role}
        </div>

        {/* Bulb */}
        {/* Bulb */}
        <div
          style={{
            gridArea: '1 / 3 / 3 / 4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(3rem, 15vw, 12rem)',
              lineHeight: 1,
            }}
          >
            <Bulb player={me} phase={gameState.phase} />
          </span>
        </div>

        {/* Keypad */}
        <div
          style={{
            gridArea: '3 / 1 / 4 / 4',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Keypad onKeypress={onKeypress} isLocked={false} />
        </div>
      </div>
    </div>
  );
}

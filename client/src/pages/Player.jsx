// src/pages/Player.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send, subscribe, subscribeStatus } from '../ws';
import { Keypad } from '../components/Keypad';
import { Bulb } from '../components/Bulb';

export default function Player() {
  const { id } = useParams();
  const playerId = Number(id);
  const [gameState, setGameState] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    connect();

    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE' && msg.payload) {
        setGameState(msg.payload);

        // Check if player exists in state
        const exists = msg.payload.players?.some((p) => p?.id === playerId);
        setIsRegistered(exists);
      }
    });

    const unsubStatus = subscribeStatus(setWsStatus);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, [playerId]);

  // Register player when WS connected and not already registered
  useEffect(() => {
    if (wsStatus === 'connected' && !isRegistered) {
      console.log(`[Player] Registering Player ${playerId}`);
      send('REGISTER_PLAYER', { id: playerId });
    }
  }, [wsStatus, isRegistered, playerId]);

  if (!gameState) return <div>Loading... (WS: {wsStatus})</div>;

  const me = gameState.players?.find((p) => p?.id === playerId);
  if (!me) return <div>Registering Player {playerId}...</div>;

  const onKeypress = (key) => {
    console.log(`[Player] Key pressed: ${key}`);
    send('PLAYER_KEYPRESS', { id: playerId, key });
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        <div style={styles.bigNumber}>{me.id}</div>
        <div style={styles.name}>{me.name}</div>
        <div style={styles.role}>{me.role}</div>
        <div style={styles.bulb}>
          <Bulb player={me} phase={gameState.phase} />
        </div>
        <div style={styles.keypad}>
          <Keypad onKeypress={onKeypress} isLocked={false} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '1rem',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gridTemplateRows: 'auto auto 1fr',
    gap: '1rem',
    maxWidth: '800px',
    width: '100%',
  },
  bigNumber: {
    gridArea: '1 / 1 / 3 / 2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(3rem, 15vw, 10rem)',
    fontWeight: 'bold',
  },
  name: {
    gridArea: '1 / 2 / 2 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(1rem, 4vw, 2rem)',
    fontWeight: '500',
  },
  role: {
    gridArea: '2 / 2 / 3 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(2rem, 8vw, 5rem)',
    fontWeight: 'bold',
  },
  bulb: {
    gridArea: '1 / 3 / 3 / 4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(3rem, 15vw, 12rem)',
    lineHeight: 1,
  },
  keypad: {
    gridArea: '3 / 1 / 4 / 4',
    display: 'flex',
    justifyContent: 'center',
  },
};

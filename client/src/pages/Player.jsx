import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send } from '../ws';
import { Keypad } from '../components/Keypad';
import { Bulb } from '../components/Bulb';

export default function Player() {
  const { id } = useParams();
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    connect(setGameState);
  }, []);

  useEffect(() => {
    if (!gameState) return;
    const player = gameState.players[String(id)];
    if (!player) {
      send('REGISTER_PLAYER', {
        id: String(id),
        name: `Player ${id}`,
      });
    }
  }, [gameState, id]);

  if (!gameState) return <div>Loading...</div>;
  const me = gameState.players[String(id)];
  if (!me) return <div>Registering Player {id}...</div>;

  const styles = {
    console: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gridTemplateRows: '1fr 1fr 2fr',
      gridTemplateAreas: `
      "bigNum name badges"
      "bigNum role badges"
      "controls controls controls"
    `,
      gap: '0.5rem',
      height: '100vh', // or fit parent
      width: '100vw',
      padding: '2rem', // ✅ new margin
      boxSizing: 'border-box', // ensures margin doesn’t push content off screen
    },
    bigNum: {
      gridArea: 'bigNum',
      gridRow: '1 / span 2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(2rem, 20vw, 15rem)',
      fontWeight: 'bold',
    },
    role: {
      gridArea: 'role',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(2rem, 10vw, 8rem)', // scales with space
      fontWeight: 'bold',
    },
    name: {
      gridArea: 'name',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(1rem, 5vw, 4rem)', // ~50% of role size
      fontWeight: '500',
    },
    badges: {
      gridArea: 'badges',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    controls: {
      gridArea: 'controls',
    },
  };

  return (
    <div style={styles.console}>
      <div style={styles.bigNum}>{me.id}</div>
      <div style={styles.name}>{me.name}</div>
      <div style={styles.role}>{me.role}</div>
      <div style={styles.badges}>
        <Bulb />
      </div>
      <div style={styles.controls}>
        <Keypad />
      </div>
    </div>
  );
}

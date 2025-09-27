import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send } from '../ws';
import { Keypad } from '../components/Keypad';
import { Bulb } from '../components/Bulb';
import { BigNum } from '../components/BigNum';

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
    page: {
      display: 'grid',
      gridTemplateRows: 'auto auto', // first row + keypad row
      rowGap: '2rem',
      justifyItems: 'center', // center second row (Keypad)
      padding: '2rem',
    },
    firstRow: {
      display: 'grid',
      gridTemplateColumns: 'auto', // single column for first row
      justifyItems: 'center',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
    },
    bigNum: {
      position: 'absolute',
      left: 0,
    },
    infoColumn: {
      display: 'grid',
      gridTemplateRows: 'auto auto auto', // bulb, name, role
      justifyItems: 'center',
      rowGap: '1rem',
    },
  };

  return (
    <div style={styles.page}>
      {/* First row */}
      <div style={styles.firstRow}>
        <div style={styles.bigNum}>
          <BigNum value={me.id} />
        </div>
        <div style={styles.infoColumn}>
          <Bulb />
          <div>{me.name}</div>
          <div>{me.role}</div>
        </div>
      </div>

      {/* Second row */}
      <Keypad />
    </div>
  );
}

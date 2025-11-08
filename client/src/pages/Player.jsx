import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send, subscribe, subscribeStatus } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import styles from './Player.module.css';

export default function Player({ id: propId, compact = false }) {
  const params = useParams();
  const playerId = propId ?? Number(params.id);
  const [gameState, setGameState] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const registeredRef = useRef(false);

  useEffect(() => {
    connect();
    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE') setGameState(msg.payload);
    });
    const unsubStatus = subscribeStatus(setWsStatus);
    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);

  useEffect(() => {
    if (wsStatus === 'connected' && !registeredRef.current) {
      const timeout = setTimeout(() => {
        send('REGISTER_PLAYER', { id: playerId });
        registeredRef.current = true;
      }, playerId * 50);
      return () => clearTimeout(timeout);
    }
  }, [wsStatus, playerId]);

  if (!gameState) return <div>Loading... (WS: {wsStatus})</div>;

  const me = gameState.players?.find((p) => p.id === playerId);
  if (!me) return <div>Registering Player {playerId}...</div>;

  const actionType = Object.keys(me.actions || {}).find(
    (a) => me.actions[a].isConfirmed === false
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.number}>{me.id}</div>
        <div className={styles.name}>{me.name}</div>
        <div className={styles.role} style={{ color: me.color }}>
          {me.role}
        </div>
        <Bulb player={me} phase={gameState.phase} />
        <Keypad player={me} actionType={actionType} />
      </div>
    </div>
  );
}

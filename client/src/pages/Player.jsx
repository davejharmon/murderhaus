import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connect, send, subscribe, subscribeStatus } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import styles from './Player.module.css';

export default function Player({ id: propId, compact = false }) {
  const params = useParams();
  const playerId = propId !== undefined ? Number(propId) : Number(params.id);
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  const [gameState, setGameState] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const registeredRef = useRef(false); // track registration

  // Connect WebSocket and subscribe to messages
  useEffect(() => {
    connect();

    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE' && msg.payload) {
        setGameState(msg.payload);
      }
    });

    const unsubStatus = subscribeStatus(setWsStatus);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);

  // Register player exactly once when WS connects
  useEffect(() => {
    if (wsStatus === 'connected' && !registeredRef.current) {
      send('REGISTER_PLAYER', { id: playerId });
      registeredRef.current = true;
    }
  }, [wsStatus, playerId]);

  if (!gameState)
    return <div className={styles.loading}>Loading... (WS: {wsStatus})</div>;

  const me = gameState.players?.find((p) => p?.id === playerId);
  if (!me)
    return (
      <div className={styles.loading}>Registering Player {playerId}...</div>
    );

  const roleColor = me.color || 'gray';
  const onKeypress = (key) => send('PLAYER_KEYPRESS', { id: playerId, key });

  const Wrapper = compact ? 'div' : 'div';
  const wrapperClass = compact ? undefined : styles.pageWrapper;

  return (
    <Wrapper className={wrapperClass}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.number}>{me.id}</div>
          <div className={styles.name}>{me.name}</div>
          <div className={styles.role} style={{ color: roleColor }}>
            {me.role}
          </div>
          <div className={styles.bulb}>
            <Bulb player={me} phase={gameState.phase} />
          </div>
          <div className={styles.keypadWrapper}>
            <Keypad onKeypress={onKeypress} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

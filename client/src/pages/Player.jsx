// src/pages/Player.jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { send } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import styles from './Player.module.css';

export default function Player({
  id: propId,
  compact = false,
  gameState = null,
  wsStatus = 'disconnected',
}) {
  const params = useParams();
  const playerId = propId !== undefined ? Number(propId) : Number(params.id);
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  // Register player once when gameState is available
  useEffect(() => {
    if (!gameState) return;
    send('REGISTER_PLAYER', { id: playerId });
  }, [playerId, gameState]);

  if (!gameState)
    return <div className={styles.loading}>Loading... (WS: {wsStatus})</div>;

  const me = gameState.players?.find((p) => p?.id === playerId);
  if (!me)
    return (
      <div className={styles.loading}>Registering Player {playerId}...</div>
    );

  const roleColor = me.color || 'gray';

  return (
    <div className={compact ? undefined : styles.pageWrapper}>
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
            <Keypad
              player={me}
              actionType={me.activeActions?.[0] ?? null} // null disables buttons
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Player.jsx
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { send, subscribe } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import { useGameState } from '../hooks/useGameState';
import styles from './Player.module.css';

export default function Player({ compact = false, id }) {
  const params = useParams();
  const playerId = Number(id ?? params.id); // prop first, then route param
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  const { wsStatus, gameMeta, me, setMe } = useGameState(
    ['PLAYER_UPDATE', 'GAME_META_UPDATE'],
    playerId
  );

  const registeredRef = useRef(false);

  // Subscribe to this player's updates
  useEffect(() => {
    const unsub = subscribe(`PLAYER_UPDATE:${playerId}`, setMe);
    return () => unsub();
  }, [playerId, setMe]);

  // Register player once per mount
  useEffect(() => {
    if (!registeredRef.current) {
      send('REGISTER_PLAYER', { id: playerId });
      registeredRef.current = true;
    }
  }, [playerId]);

  if (!me)
    return (
      <div className={styles.loading}>
        Registering Player {playerId}... (WS: {wsStatus})
      </div>
    );

  const roleColor = me.color || 'gray';

  return (
    <div className={compact ? undefined : styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.number}>{me.id}</div>
          <div className={styles.name}>{me.name}</div>
          <div className={styles.role} style={{ color: roleColor }}>
            {me.role || 'Unassigned'}
          </div>

          <div className={styles.bulb}>
            <Bulb player={me} size={40} showConfirmed />
          </div>

          <div className={styles.keypadWrapper}>
            <Keypad player={me} activeActions={me.availableActions || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

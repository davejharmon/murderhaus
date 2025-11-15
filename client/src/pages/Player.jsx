// src/pages/Player.jsx
import { useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { send, subscribe } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import { useGameState } from '../hooks/useGameState';
import styles from './Player.module.css';

export default function Player({ compact = false, id }) {
  const params = useParams();
  const playerId = Number(id ?? params.id);
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  const { wsStatus, gameMeta, me, setMe } = useGameState(
    ['PLAYER_UPDATE', 'GAME_META_UPDATE'],
    playerId
  );

  const registeredRef = useRef(false);

  // 🔥 SUBSCRIBE — runs always, hook order unchanged
  useEffect(() => {
    const unsub = subscribe(`PLAYER_UPDATE:${playerId}`, setMe);
    return () => unsub();
  }, [playerId, setMe]);

  // 🔥 REGISTER PLAYER — runs always, hook order unchanged
  useEffect(() => {
    if (!registeredRef.current) {
      send('REGISTER_PLAYER', { id: playerId });
      registeredRef.current = true;
    }
  }, [playerId]);

  // 🔥 NEW HOOKS MUST GO HERE (always before return)
  const activeActions = useMemo(() => {
    return me?.availableActions ?? [];
  }, [me]);

  const roleColor = me?.color || 'gray';

  // 🔥 SAFE EARLY RETURN AFTER ALL HOOKS
  if (!me)
    return (
      <div className={styles.loading}>
        Registering Player {playerId}... (WS: {wsStatus})
      </div>
    );

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
            <Keypad player={me} activeActions={activeActions} />
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Player.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { send, subscribe } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import { useGameState } from '../hooks/useGameState';
import styles from './Player.module.css';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Player({ compact = false, id }) {
  const params = useParams();
  const playerId = Number(id ?? params.id);
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  usePageTitle(`Player ${playerId}`);

  const { wsStatus, gameMeta, me, setMe } = useGameState(
    ['PLAYER_UPDATE', 'GAME_META_UPDATE'],
    playerId
  );

  const [existsOnServer, setExistsOnServer] = useState(null);
  const registeredRef = useRef(false);

  // ----------------------------------------------------
  // 1) Subscribe to WS updates
  // ----------------------------------------------------
  useEffect(() => {
    const unsub = subscribe(`PLAYER_UPDATE:${playerId}`, setMe);
    return () => unsub();
  }, [playerId, setMe]);

  // ----------------------------------------------------
  // 2) Query server if this ID already exists
  // ----------------------------------------------------
  useEffect(() => {
    const unsub = subscribe('PLAYER_EXISTS', (data) => {
      if (data.id === playerId) {
        setExistsOnServer(data.exists);
      }
    });

    send('QUERY_PLAYER_EXISTS', { id: playerId });

    return () => unsub();
  }, [playerId]);

  // ----------------------------------------------------
  // 3) Register only if needed
  // ----------------------------------------------------
  useEffect(() => {
    if (existsOnServer === null) return; // still waiting
    if (registeredRef.current) return;

    if (existsOnServer) {
      console.log(
        `%cPlayer ${playerId} already registered — skipping register`,
        'color: orange'
      );
    } else {
      console.log(`Registering player ${playerId} (new client)`);
      send('REGISTER_PLAYER', { id: playerId });
    }

    registeredRef.current = true;
  }, [existsOnServer, playerId]);

  // ----------------------------------------------------
  // Hooks must stay above return
  // ----------------------------------------------------
  const activeActions = useMemo(() => me?.availableActions ?? [], [me]);
  const roleColor = me?.color || 'gray';

  if (!me)
    return (
      <div className={styles.loading}>
        Loading Player {playerId}... (WS: {wsStatus})
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
            <Bulb player={me} phase={gameMeta.phase} />
          </div>

          <div className={styles.keypadWrapper}>
            <Keypad player={me} activeActions={activeActions} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { send, subscribe } from '../ws';
import { Bulb } from '../components/Bulb';
import { Keypad } from '../components/Keypad';
import { TinyScreen } from '../components/TinyScreen';
import { useGameState } from '../hooks/useGameState';
import styles from './Player.module.css';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Player({ compact = false, id }) {
  const params = useParams();
  const playerId = Number(id ?? params.id);
  if (isNaN(playerId)) throw new Error('Invalid player ID');

  usePageTitle(`Player ${playerId}`);
  // 🟢 Updated hook usage with simplified slices
  const { wsStatus, game, me } = useGameState(playerId);
  // Track whether the player exists on server
  const [existsOnServer, setExistsOnServer] = useState(null);

  // Prevent multiple sends for registration or query
  const registeredRef = useRef(false);
  const queriedRef = useRef(false);

  // ----------------------------
  // Subscribe to PLAYER_EXISTS once
  // ----------------------------
  useEffect(() => {
    let mounted = true;

    const unsub = subscribe('PLAYER_EXISTS', (data) => {
      if (!mounted) return;
      if (data.playerId === playerId) setExistsOnServer(data.exists);
    });

    if (!queriedRef.current) {
      queriedRef.current = true;
      send('QUERY_PLAYER_EXISTS', { playerId });
    }

    return () => {
      mounted = false;
      unsub();
    };
  }, [playerId]);

  // ----------------------------
  // Register player if not exists
  // ----------------------------
  useEffect(() => {
    if (existsOnServer === null || registeredRef.current) return;

    if (!existsOnServer) {
      send('REGISTER_PLAYER', { playerId });
    } else {
      console.log(`[DEBUG] Player ${playerId} already exists on server.`);
    }

    registeredRef.current = true;
  }, [existsOnServer, playerId]);

  // ----------------------------
  // Derived values
  // ----------------------------
  const activeActions = useMemo(() => me?.availableActions ?? [], [me]);
  const roleColor = me?.color || 'gray';
  const currentPhase = game?.phase; // phase is now inside game slice

  if (!me)
    return (
      <div className={styles.loading}>
        Loading Player {playerId}... (WS: {wsStatus})
      </div>
    );

  return (
    <div className={compact ? undefined : styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.parent}>
          <div className={styles.number}>{me.id}</div>
          <div className={styles.name}>{me.name}</div>
          <div className={styles.role} style={{ color: roleColor }}>
            {me.role || 'Unassigned'}
          </div>
          <div className={styles.bulb}>
            <Bulb player={me} phase={currentPhase} />
          </div>

          {/* TinyScreen above keypad */}
          <TinyScreen playerId={playerId} />

          <div className={styles.keypadWrapper}>
            <Keypad player={me} activeActions={activeActions} />
          </div>
        </div>
      </div>
    </div>
  );
}

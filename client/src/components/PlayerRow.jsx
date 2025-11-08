import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bulb } from './Bulb';
import { Button } from './Button';
import { NumberEmoji } from './NumberEmoji';
import styles from './PlayerRow.module.css';
import { send } from '../ws';
export const PlayerRow = React.memo(
  function PlayerRow({
    player,
    actions = [],
    DEBUG = true,
    variant = 'dark',
    voteSelectors = [],
  }) {
    const [name, setName] = useState(player.name || '');
    const [isEditing, setIsEditing] = useState(false);

    // Sync name unless editing
    useEffect(() => {
      if (!isEditing) setName(player.name || '');
    }, [player.name, isEditing]);

    const handleChange = useCallback((e) => setName(e.target.value), []);

    const handleBlur = useCallback(() => {
      setIsEditing(false);
      if (player.name !== name) {
        send('UPDATE_PLAYER_NAME', { id: player.id, name });
      }
    }, [name, player.id, player.name]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter') e.target.blur();
        else if (e.key === 'Escape') {
          setName(player.name || '');
          setIsEditing(false);
        }
      },
      [player.name]
    );

    const bgColor = player.isConfirmed ? '#666' : undefined;

    const memoedVoteSelectors = useMemo(() => {
      return voteSelectors.map(({ id, isConfirmed }) => (
        <NumberEmoji key={`vote-${id}`} number={id} isConfirmed={isConfirmed} />
      ));
    }, [voteSelectors]);

    return (
      <div
        className={`${styles.row} ${!player.isAlive ? styles.dead : ''} ${
          variant === 'light' ? styles.light : ''
        }`}
        style={{ backgroundColor: bgColor, transition: '0.25s' }}
      >
        <div className={styles.leftSection}>
          <div className={styles.number}>{player.id}</div>

          <div className={styles.bulb}>
            <Bulb player={player} phase={player.phase} />
          </div>

          {isEditing ? (
            <input
              className={styles.nameInput}
              type='text'
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className={styles.name} onClick={() => setIsEditing(true)}>
              {name || 'Unnamed'}
            </span>
          )}

          <span
            className={styles.role}
            style={{ color: player.color || 'gray' }}
          >
            {player.role || 'Unknown'}
          </span>

          {memoedVoteSelectors.length > 0 && (
            <div className={styles.selections}>{memoedVoteSelectors}</div>
          )}
        </div>

        <div className={styles.rightSection}>
          {actions.map((act, i) => (
            <Button key={i} label={act.label} onClick={act.action} />
          ))}
        </div>

        {DEBUG && (
          <div className={styles.debug}>
            {Object.entries(player)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    // Only rerender if relevant props actually change
    return (
      prev.player.id === next.player.id &&
      prev.player.name === next.player.name &&
      prev.player.isAlive === next.player.isAlive &&
      prev.player.isConfirmed === next.player.isConfirmed &&
      prev.player.color === next.player.color &&
      prev.player.role?.name === next.player.role?.name &&
      prev.voteSelectors === next.voteSelectors &&
      prev.actions === next.actions &&
      prev.DEBUG === next.DEBUG &&
      prev.variant === next.variant
    );
  }
);

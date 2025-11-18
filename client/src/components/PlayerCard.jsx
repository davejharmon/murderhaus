// src/components/PlayerCard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bulb } from './Bulb';
import { Button } from './Button';
import { NumberEmoji } from './NumberEmoji';
import styles from './PlayerCard.module.css';
import { send } from '../ws';

export const PlayerCard = React.memo(function PlayerCard({
  player,
  actions = [],
  selectionGlyphs = [],
  DEBUG = false,
  variant = 'dark',
  phase,
}) {
  const [name, setName] = useState(player.name || '');
  const [isEditing, setIsEditing] = useState(false);

  // Sync name with game state unless editing
  useEffect(() => {
    if (!isEditing) setName(player.name || '');
  }, [player.name, isEditing]);

  const handleChange = useCallback((e) => setName(e.target.value), []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (player.name !== name) {
      send('HOST_UPDATE_PLAYER_NAME', { id: player.id, name });
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
  // Render vote selectors (NumberEmoji)
  const memoedselectionGlyphs = useMemo(() => {
    return selectionGlyphs.map(({ id, isConfirmed, col }) => (
      <NumberEmoji
        key={`vote-${id}`}
        number={id}
        color={col}
        isConfirmed={isConfirmed}
      />
    ));
  }, [selectionGlyphs]);

  return (
    <div
      className={`${styles.row} ${!player.state.isAlive ? styles.dead : ''} ${
        variant === 'light' ? styles.light : ''
      }`}
      style={{ transition: '0.25s' }}
    >
      <div className={styles.leftSection}>
        <div className={styles.number}>{player.id}</div>

        <div className={styles.bulb}>
          <Bulb player={player} phase={phase} />
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

        <span className={styles.role} style={{ color: player.color || 'gray' }}>
          {player.role || 'Unassigned'}
        </span>

        {memoedselectionGlyphs.length > 0 && (
          <div className={styles.selections}>{memoedselectionGlyphs}</div>
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
});

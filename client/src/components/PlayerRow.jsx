import React, { useState, useEffect } from 'react';
import { Bulb } from './Bulb';
import { Button } from './Button';
import { NumberEmoji } from './NumberEmoji';
import { send } from '../ws';
import styles from './PlayerRow.module.css';

export function PlayerRow({
  player,
  actions = [], // hostActions provided by Host.jsx
  DEBUG = false,
  variant = 'dark',
  voteSelectors = [], // Array of { id, isConfirmed }
}) {
  const [name, setName] = useState(player.name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setName(player.name || '');
  }, [player, isEditing]);

  const handleChange = (e) => setName(e.target.value);

  const handleBlur = () => {
    setIsEditing(false);
    if (player.name !== name)
      send('UPDATE_PLAYER_NAME', { id: player.id, name });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    else if (e.key === 'Escape') {
      setName(player.name || '');
      setIsEditing(false);
    }
  };

  const { activeAction, validTargets, selection, isConfirmed } = player;

  return (
    <div
      className={`${styles.row} ${!player.isAlive ? styles.dead : ''} ${
        variant === 'light' ? styles.light : ''
      }`}
      style={{
        backgroundColor: isConfirmed ? '#666' : undefined,
        transition: '0.25s',
      }}
    >
      <div className={styles.leftSection}>
        <div className={styles.number}>{player.id}</div>
        <div className={styles.bulb}>
          <Bulb player={player} phase={player.phase} />
        </div>

        {isEditing ? (
          <input
            className={styles.nameInput}
            value={name}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <span className={styles.name} onClick={() => setIsEditing(true)}>
            {player.name || 'Unnamed'}
          </span>
        )}

        <span className={styles.role} style={{ color: player.color || 'gray' }}>
          {player.role || 'Unassigned'}
        </span>

        {/* Incoming selections targeting this player */}
        {voteSelectors.length > 0 && (
          <div className={styles.selections}>
            {voteSelectors.map(({ id, isConfirmed }) => (
              <NumberEmoji
                key={`vote-${id}`}
                number={id}
                isConfirmed={isConfirmed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Host actions rendered at right */}
      <div className={styles.rightSection}>
        {actions.map((act, i) => (
          <Button
            key={i}
            label={act.label}
            onClick={() =>
              send('EXECUTE_HOST_ACTION', {
                playerId: player.id,
                actionName: act.action,
              })
            }
          />
        ))}
      </div>

      {DEBUG && (
        <div className={styles.debug}>
          {Object.entries(player)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(', ')}
        </div>
      )}
    </div>
  );
}

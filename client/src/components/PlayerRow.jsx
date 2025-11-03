import React, { useState, useEffect } from 'react';
import { Bulb } from './Bulb';
import { Button } from './Button';
import { NumberEmoji } from './NumberEmoji';
import { send } from '../ws';
import styles from './PlayerRow.module.css';

export function PlayerRow({
  player,
  actions = [],
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

  return (
    <div
      className={`${styles.row} ${!player.isAlive ? styles.dead : ''} ${
        variant === 'light' ? styles.light : ''
      }`}
      style={{
        backgroundColor: player.isConfirmed ? '#666' : undefined,
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
          {player.role}
        </span>
        {/* Render NumberEmoji for all players currently selecting this player */}
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
}

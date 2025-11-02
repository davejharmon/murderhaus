import { useState, useEffect } from 'react';
import { send } from '../ws';
import { Bulb } from './Bulb';
import { NumberEmoji } from './NumberEmoji';
import { Button } from './Button';

export function PlayerRow({ player, DEBUG = false }) {
  const [name, setName] = useState(player.name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setName(player.name || '');
  }, [player, isEditing]);

  const handleChange = (e) => setName(e.target.value);

  const handleBlur = () => {
    setIsEditing(false);
    if (player.name !== name) {
      send('UPDATE_PLAYER_NAME', { id: player.id, name });
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.leftSection}>
        <Bulb player={player} color={player.color} phase={player.phase} />
        <NumberEmoji number={player.id} />
        {isEditing ? (
          <input
            type='text'
            value={name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            onFocus={(e) => e.target.select()}
            style={styles.input}
          />
        ) : (
          <span onClick={() => setIsEditing(true)} style={styles.nameLabel}>
            {name || 'Unnamed'}
          </span>
        )}
      </div>

      <div style={styles.rightSection}>
        <span style={styles.role}>{player.role}</span>
        <Button label='kill' size='small' />
        <Button label='reveal' size='small' />
      </div>

      {DEBUG && (
        <div style={styles.debug}>
          {Object.entries(player)
            .map(
              ([k, v]) =>
                `${k}: ${
                  v === null
                    ? 'null'
                    : typeof v === 'object'
                    ? JSON.stringify(v)
                    : String(v)
                }`
            )
            .join(', ')}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    backgroundColor: '#d3eaf2',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexGrow: 1,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  nameLabel: {
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f4f4f4',
    minWidth: '5ch',
  },
  input: {
    fontWeight: 'bold',
    border: '1px solid #007bff',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    minWidth: '5ch',
    backgroundColor: '#fff',
  },
  role: { color: '#000', fontWeight: 500 },
  debug: { fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' },
};

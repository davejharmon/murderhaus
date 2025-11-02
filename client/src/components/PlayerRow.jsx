import { useState, useEffect } from 'react';
import { Bulb } from './Bulb';
import { NumberEmoji } from './NumberEmoji';
import { Button } from './Button';
import { send } from '../ws'; // make sure you import this

export function PlayerRow({ player, actions = [], DEBUG = false }) {
  const [name, setName] = useState(player.name || '');
  const [isEditing, setIsEditing] = useState(false);

  // Update name if player object changes
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

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    backgroundColor: player.isAlive ? '#f0f0f0' : '#ddd',
    opacity: player.isAlive ? 1 : 0.5,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const leftSection = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
  const rightSection = { display: 'flex', gap: '0.5rem' };

  return (
    <div style={rowStyle}>
      <div style={leftSection}>
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
            style={{
              fontWeight: 'bold',
              border: '1px solid #007bff',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              minWidth: '3ch',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            style={{ fontWeight: 'bold', cursor: 'text', minWidth: '3ch' }}
          >
            {name || 'Unnamed'}
          </span>
        )}
        <span style={{ color: player.color, fontWeight: 'bold' }}>
          {player.role}
        </span>
      </div>

      <div style={rightSection}>
        {actions.map((act, i) => (
          <Button key={i} label={act.label} onClick={act.action} />
        ))}
      </div>

      {DEBUG && (
        <div style={{ fontSize: '0.8rem', color: 'gray', marginTop: '4px' }}>
          {Object.entries(player)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}
        </div>
      )}
    </div>
  );
}

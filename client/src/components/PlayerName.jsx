// src/components/PlayerName.jsx
import { useState, useEffect } from 'react';
import { send } from '../ws';

export function PlayerName({ player, gameState, setGameState }) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(player?.name ?? '');

  // Sync input if player changes
  useEffect(() => {
    setNameInput(player?.name ?? '');
  }, [player]);

  if (!player) return null; // defensive guard

  return (
    <input
      type='text'
      value={editing ? nameInput : player.name}
      readOnly={!editing}
      style={{
        fontWeight: 'bold',
        cursor: editing ? 'text' : 'pointer',
        border: editing ? '1px solid #ccc' : 'none',
        borderRadius: '4px',
        padding: '2px 4px',
        backgroundColor: editing ? '#fff' : 'transparent',
        minWidth: '50px',
        pointerEvents: 'auto',
      }}
      onClick={() => setEditing(true)}
      onChange={(e) => setNameInput(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (nameInput !== player.name) {
          // Update locally
          setGameState((prev) => {
            const updatedPlayers = prev.players.map((p) =>
              p?.id === player.id ? { ...p, name: nameInput } : p
            );
            return { ...prev, players: updatedPlayers };
          });
          // Send to server
          send('UPDATE_PLAYER_NAME', { id: player.id, name: nameInput });
        }
      }}
    />
  );
}

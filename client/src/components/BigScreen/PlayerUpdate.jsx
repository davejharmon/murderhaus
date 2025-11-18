import React from 'react';

export default function PlayerUpdate({ player, text }) {
  if (!player) return null;

  return (
    <div className='bigscreen-playerupdate'>
      <div
        className='bigscreen-playerupdate-name'
        style={{ color: player.color }}
      >
        {player.name}
      </div>
      {text && <div className='bigscreen-playerupdate-text'>{text}</div>}
    </div>
  );
}

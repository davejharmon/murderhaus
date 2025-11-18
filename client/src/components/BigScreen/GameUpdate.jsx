import React from 'react';

export default function GameUpdate({ players = [], text }) {
  return (
    <div className='bigscreen-gameupdate'>
      {text && <div className='bigscreen-gameupdate-text'>{text}</div>}

      {players.length > 0 && (
        <div className='bigscreen-gameupdate-players'>
          {players.map((p) => (
            <div key={p.id} className='bigscreen-gameupdate-player'>
              <span style={{ color: p.color }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function Gallery({ players = [], header }) {
  return (
    <div className='bigscreen-gallery'>
      {header && <div className='bigscreen-gallery-header'>{header}</div>}

      <div className='bigscreen-gallery-grid'>
        {players.map((p) => (
          <div key={p.id} className='bigscreen-gallery-item'>
            <img src={p.image} alt={p.name} className='bigscreen-gallery-img' />
            <div className='bigscreen-gallery-name'>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

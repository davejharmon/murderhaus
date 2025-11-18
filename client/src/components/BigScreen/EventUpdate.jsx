import React from 'react';

export default function EventUpdate({ event }) {
  if (!event) return null;

  return (
    <div className='bigscreen-eventupdate'>
      <div className='bigscreen-eventupdate-title'>{event.title}</div>

      {event.description && (
        <div className='bigscreen-eventupdate-description'>
          {event.description}
        </div>
      )}

      {event.players && event.players.length > 0 && (
        <div className='bigscreen-eventupdate-players'>
          {event.players.map((p) => (
            <span key={p.id} className='bigscreen-eventupdate-player'>
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

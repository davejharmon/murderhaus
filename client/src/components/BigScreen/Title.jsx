import React from 'react';

export default function Title({ text, color }) {
  if (!text) return null;

  return (
    <div className='bigscreen-title' style={{ color }}>
      {text}
    </div>
  );
}

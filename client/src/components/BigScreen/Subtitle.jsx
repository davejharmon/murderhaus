import React from 'react';

export default function Subtitle({ text }) {
  if (!text) return null;

  return <div className='bigscreen-subtitle'>{text}</div>;
}

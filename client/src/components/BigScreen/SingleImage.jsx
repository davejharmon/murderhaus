// src/components/BigScreen/SingleImage.jsx
import React from 'react';

export default function SingleImage({ path, alt = '' }) {
  if (!path) return null;

  return (
    <img
      src={path}
      alt={alt}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}

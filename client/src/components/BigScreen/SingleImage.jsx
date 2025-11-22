import React from 'react';

const imgStyle = {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
};

export default function SingleImage({ path, alt = '' }) {
  if (!path) return null;

  return <img src={path} alt={alt} style={imgStyle} />;
}

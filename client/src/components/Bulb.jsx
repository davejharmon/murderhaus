import React, { useMemo } from 'react';

export const Bulb = React.memo(function Bulb({ player, size = 40 }) {
  const color = player.bulbColor || '#555555';

  const style = useMemo(() => {
    return {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color} 0%, #111 80%)`,
      display: 'inline-block',
    };
  }, [color, size]);

  return <div style={style} />;
});

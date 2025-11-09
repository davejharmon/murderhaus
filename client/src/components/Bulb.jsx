// src/components/Bulb.jsx
import React, { useMemo } from 'react';

/**
 * Bulb shows a visual indicator for a player:
 * - Color based on role/team or custom `bulbColor`
 * - Dimmed if dead
 * - Optionally shows confirmation highlight
 */
export const Bulb = React.memo(function Bulb({
  player,
  size = 40,
  showConfirmed = true,
}) {
  const color = player.color || '#666';
  const isDead = !player.isAlive;
  const confirmed = showConfirmed
    ? Object.values(player.confirmedSelections || {}).some((v) => v)
    : false;

  const style = useMemo(() => {
    return {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: isDead
        ? '#222'
        : confirmed
        ? `radial-gradient(circle at 30% 30%, ${color} 0%, #111 70%)`
        : `radial-gradient(circle at 30% 30%, ${color} 0%, #333 80%)`,
      border: confirmed ? '2px solid #fff' : 'none',
      boxShadow: confirmed ? `0 0 8px 2px ${color}aa` : '0 0 4px 1px #00000088',
      transition: '0.25s all ease-in-out',
      display: 'inline-block',
    };
  }, [color, size, isDead, confirmed]);

  return <div style={style} />;
});

import { getBulbColor } from '../helpers/getBulbColor';
export const Bulb = ({ player, phase }) => {
  const bulbs = {
    red: '🔴',
    white: '⚪',
    yellow: '🟡',
    black: '⚫',
  };

  const color = getBulbColor(player, phase);
  return bulbs[color] || '❓';
};

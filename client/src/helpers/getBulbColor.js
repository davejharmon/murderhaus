// bulbLogic.js
export function getBulbColor(player, phase) {
  if (!player?.isAlive) return 'black';

  if (phase === 'LOBBY') {
    return 'yellow';
  }

  if (phase === 'EVENING') {
    if (player.isRevealed && player.role === 'MURDERER') return 'red';
    if (player.vote?.confirmed) return 'white';
    if (player.vote) return 'yellow';
  }

  return 'yellow'; // fallback
}

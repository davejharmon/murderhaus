export function getBulbColor(player, phase) {
  // Safety check
  if (!player) return 'black';

  // Handle LOBBY phase
  if (phase === 'LOBBY') {
    // If connected (we assume isAlive implies connected)
    return player.isAlive ? 'yellow' : 'black';
  }

  // Handle MORNING phase
  if (phase === 'MORNING') {
    if (!player.isAlive) return 'black';
    return 'yellow';
  }

  // Handle EVENING phase
  if (phase === 'EVENING') {
    if (!player.isAlive) return 'black';
    if (player.vote == null) return 'yellow'; // no vote yet
    return 'white'; // vote entered
  }

  // Handle NIGHTFALL phase
  if (phase === 'NIGHTFALL') {
    if (!player.isAlive) return 'black';
    if (player.team === 'CIRCLE') return 'blue';
    if (player.team === 'MURDERER') return 'red';
    return 'error'; // fallback for unassigned team
  }

  // Default fallback
  return 'black';
}

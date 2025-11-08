// server/models/BulbManager.js

export class BulbManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Get the bulb color as HEX string based on player state and phase
   * @param {Player} player
   * @returns {string} HEX color
   */
  getBulbColor(player) {
    const { phase, recentlyKilled } = this.gameState;
    const fallbackGray = '#777777';

    // Flash bright red if player was just killed
    if (recentlyKilled?.has(player.id)) {
      return '#FF0000';
    }

    // Dead players
    if (!player.isAlive) {
      return player.team === 'MURDERERS' ? '#330000' : fallbackGray;
    }

    // Vote targets during day
    if (phase === 'day') {
      if (player.isTarget) return '#FF0000'; // top-voted player
      if (player.isTargeting) return '#FFFFFF'; // voted for top target
      if (player.actions.includes('vote')) return '#FFD700'; // warm yellow for voting
      if (player.selection !== null) return '#FFFFAA'; // selected someone
      return '#FFD700'; // default day color
    }

    // Night phase
    if (phase === 'night') {
      if (player.actions.includes('murder')) {
        if (player.selection !== null) return '#FF0000'; // confirmed murder target
        return '#660000'; // armed for murder
      }
      return '#0000FF'; // night default color
    }

    // Fallback
    return fallbackGray;
  }

  /**
   * Convert HEX to RGB array [R,G,B] for NeoPixels
   * @param {Player} player
   */
  getBulbRGB(player) {
    const hex = this.getBulbColor(player).replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  /**
   * Apply bulb colors to a list of players
   * @param {Player[]} players
   */
  applyBulbColors(players) {
    return players.map((p) => ({
      ...p,
      bulbColor: this.getBulbColor(p),
      bulbRGB: this.getBulbRGB(p),
      transition: 'snap', // placeholder for future smooth transitions
    }));
  }
}

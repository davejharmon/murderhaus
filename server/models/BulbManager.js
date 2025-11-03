// server/models/BulbManager.js
import { PHASES } from '../../shared/constants.js';

export class BulbManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Get the bulb color as HEX string
   * @param {Player} player
   * @returns {string} HEX
   */
  getBulbColor(player) {
    const phase = this.gameState.phase;
    const fallbackGray = '#777777';

    // Highlight newly killed players
    if (this.gameState.recentlyKilled.has(player.id)) {
      return '#FF0000'; // bright red flash
    }

    if (!player.isAlive) {
      // Dead players
      if (player.team === 0) return fallbackGray;
      if (player.team === 1) return '#330000'; // very dark red
      return fallbackGray;
    }

    // Alive players
    if (player.isRevealed && player.team === 1) return '#FF0000'; // bright red

    switch (phase) {
      case 'nightfall':
      case 'midnight':
        if (
          phase === 'midnight' &&
          player.actions.includes('murder') &&
          player.vote !== null
        )
          return '#FF0000'; // bright red
        if (phase === 'midnight' && player.actions.includes('murder'))
          return '#660000'; // dark red
        return '#0000FF'; // cold night blue

      case 'daybreak':
      case 'morning':
      case 'noon':
        return '#FFD700'; // warm yellow

      case 'afternoon':
        if (player.actions.includes('vote') && !player.isConfirmed)
          return '#FFD700'; // warm yellow
        if (player.vote !== null) return '#FFB84D'; // bright warm tone
        if (player.isConfirmed) return '#FF0000'; // bright red
        return '#FFD700'; // default warm yellow

      case 'evening':
        return '#00FF00'; // green (vote results placeholder)

      default:
        return fallbackGray;
    }
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
      transition: 'snap', // placeholder, can evolve later
    }));
  }
}

export class HostActionManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Get available host actions for a given player
   * @param {Player} player
   * @returns {Array<{label: string, action: string}>}
   */
  getPlayerHostActions(player) {
    const actions = [];

    // Kick is always available
    actions.push({ label: 'Kick', action: 'kick_player' });

    const gameStarted = !!(this.gameState.day && this.gameState.phase);

    if (!gameStarted) {
      // Before game start: assign role
      actions.push({ label: 'Assign Role', action: 'assign_role' });
    } else {
      // After game start: kill/revive
      actions.push({
        label: player.isAlive ? 'Kill' : 'Revive',
        action: player.isAlive ? 'kill_player' : 'revive_player',
      });
    }

    return actions;
  }

  /**
   * Get host actions for all players in the game
   * @returns {Array<{playerId: number, hostActions: Array}>}
   */
  getAllHostActions() {
    return this.gameState.players.map((player) => ({
      playerId: player.id,
      hostActions: this.getPlayerHostActions(player),
    }));
  }

  /**
   * Get global host actions (not tied to a player)
   * e.g., end game, set phase
   */
  getGlobalActions() {
    const gameStarted = !!(this.gameState.day && this.gameState.phase);
    const actions = [];

    if (!gameStarted) {
      actions.push({ label: 'Start Game', action: 'start_game' });
    }

    // Phase controls
    if (gameStarted) {
      ['day', 'night'].forEach((phase) =>
        actions.push({
          label: `Set Phase: ${phase}`,
          action: `set_phase:${phase}`,
        })
      );

      actions.push({ label: 'End Game', action: 'end_game' });
    }

    return actions;
  }
}

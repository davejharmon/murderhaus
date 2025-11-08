// /server/GameManager.js
import { Game } from './models/Game.js';
import { broadcast, sendTo } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';
import { ROLES, PHASES } from '../shared/constants.js';

class GameManager {
  constructor() {
    this.game = new Game();
  }

  /** Get a plain object snapshot of the game state */
  getState() {
    return this.game.getState();
  }

  getPlayer(id) {
    return this.game.getPlayer(id);
  }

  /** Register a new player by ID */
  registerPlayer(id) {
    const existing = this.game.players.find((p) => p.id === id);
    if (existing) return existing;

    const player = this.game.addPlayer(id);
    logger.log(`Player ${id} registered`, 'player');
    this.broadcastState();
    return player;
  }

  /** Remove a player */
  removePlayer(id) {
    this.game.removePlayer(id);
    logger.log(`Player ${id} removed`, 'player');
    this.broadcastState();
  }

  /** Start the game */
  startGame() {
    this.game.start();
    logger.log('Game started', 'system');
    this.broadcastState();
  }

  /** End the game */
  endGame() {
    this.game.reset();
    logger.log('Game ended', 'system');
    this.broadcastState();
  }

  /** Advance to a phase (host-triggered) */
  setPhase(phaseName) {
    if (!PHASES.find((p) => p.name === phaseName)) return;
    this.game.phase = phaseName;
    logger.log(`Phase set to ${phaseName}`, 'system');
    this.broadcastState();
  }

  /** Player selects a target */
  playerAction(playerId, actionType, targetId) {
    const player = this.game.getPlayer(playerId);
    if (!player || !player.availableActions.includes(actionType)) return;

    player.selection = targetId;
    logger.log(
      `Player ${playerId} selected ${targetId} for action ${actionType}`,
      'player'
    );
    this.broadcastState();
  }

  /** Player confirms their selection */
  playerConfirm(playerId, actionType) {
    const player = this.game.getPlayer(playerId);
    if (!player || player.selection === null) return;

    player.isConfirmed = true;
    logger.log(`Player ${playerId} confirmed action ${actionType}`, 'player');

    // Optionally resolve immediately if action is instant
    // this.resolveAction(player, actionType);

    this.broadcastState();
  }

  /** Player uses interrupt */
  playerInterrupt(playerId) {
    const player = this.game.getPlayer(playerId);
    if (!player || player.interruptUsed) return;

    player.interruptUsed = true;
    logger.log(`Player ${playerId} used INTERRUPT`, 'player');

    // Handle any instant interrupt effect here
    this.broadcastState();
  }

  /** Broadcast current game state to all clients */
  broadcastState() {
    broadcast({
      type: 'GAME_STATE_UPDATE',
      payload: this.getState(),
    });
  }
}

// Export singleton
export const gameManager = new GameManager();

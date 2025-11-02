import { GameState } from './models/GameState.js';
import { broadcast, sendTo } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';

export class GameManager {
  constructor() {
    this.state = new GameState();
    logger.log('GameManager initialized', 'system');
  }

  getState() {
    return this.state.serialize();
  }

  registerPlayer(ws, { id }) {
    const success = this.state.addPlayer(id);
    if (!success) {
      const msg = `Slot ${id} is already taken`;
      logger.log(msg, 'warn');
      sendTo(ws, { type: 'ERROR', payload: { message: msg } });
      return;
    }

    logger.log(`Player ${id} registered`, 'player');
    this._broadcastState();
  }

  updatePlayerName({ id, name }) {
    this.state.updatePlayerName(id, name);
    logger.log(`Player ${id} changed name to "${name}"`, 'player');
    this._broadcastState();
  }

  startGame() {
    this.state.startGame();
    logger.log(
      `Game started (Day ${this.state.day}, Phase: ${this.state.phase})`,
      'game'
    );
    this._broadcastState();
  }

  setPhase(phase) {
    this.state.setPhase(phase);
    logger.log(`Phase updated to: ${this.state.phase}`, 'game');
    this._broadcastState();
  }

  killPlayer(playerId) {
    this.state.killPlayer(playerId);
    logger.log(`Player ${playerId} killed`, 'game');
    this._broadcastState();
  }

  revivePlayer(playerId) {
    this.state.revivePlayer(playerId);
    logger.log(`Player ${playerId} revived`, 'game');
    this._broadcastState();
  }

  setPlayerRole(playerId, roleName) {
    this.state.setPlayerRole(playerId, roleName);
    this._broadcastState();
  }

  endGame() {
    if (!this.state || !this.state.players) return;

    this.state.players.forEach((p) => {
      p.role = 'UNKNOWN';
      p.team = null;
      p.color = null;
      p.actions = [];
      p.isAlive = null;
      p.isRevealed = false;
      p.vote = null;
      p.isConfirmed = false;
    });

    this.state.day = null;
    this.state.phase = null;

    // Clear log
    logger.clear();

    this._broadcastState();
  }

  _broadcastState() {
    broadcast({
      type: 'GAME_STATE_UPDATE',
      payload: this.state.serialize(),
    });
  }
}

export const gameManager = new GameManager();

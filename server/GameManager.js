import { GameState } from './models/GameState.js';
import { broadcast, sendTo } from './utils/Broadcast.js';
import { PHASES } from '../shared/constants.js';
import { logger } from './utils/Logger.js'; // singleton instance

class GameManager {
  constructor() {
    this.state = new GameState();
    logger.log('GameManager initialized', 'system');
  }

  getState() {
    return this._serializeState();
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

  // Helper: broadcast current state along with history
  _broadcastState() {
    broadcast({
      type: 'GAME_STATE_UPDATE',
      payload: this._serializeState(),
    });
  }

  // Convert state to plain object suitable for sending over WebSocket
  _serializeState() {
    return {
      day: this.state.day,
      phase: this.state.phase,
      players: this.state.players.map((p) => (p ? { ...p } : null)),
      history: logger.toHistoryStrings(),
    };
  }
}

export const gameManager = new GameManager();

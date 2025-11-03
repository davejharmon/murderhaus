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
      sendTo(ws, { type: 'ERROR', payload: { message: `Slot ${id} taken` } });
      return;
    }
    this._broadcastState();
  }

  updatePlayerName({ id, name }) {
    this.state.updatePlayerName(id, name);
    this._broadcastState();
  }

  startGame() {
    this.state.startGame();
    this._broadcastState();
  }

  setPhase(phase) {
    this.state.setPhase(phase);
    this._broadcastState();
  }

  doAction(playerId, actionType, targetId) {
    this.state.doAction(playerId, actionType, targetId);
    this._broadcastState();
  }

  confirmAction(playerId, actionType) {
    this.state.confirmAction(playerId, actionType);
    this._broadcastState();
  }

  killPlayer(playerId) {
    this.state.killPlayer(playerId);
    this._broadcastState();
  }

  revivePlayer(playerId) {
    this.state.revivePlayer(playerId);
    this._broadcastState();
  }

  setPlayerRole(playerId, roleName) {
    this.state.setPlayerRole(playerId, roleName);
    this._broadcastState();
  }

  endGame() {
    this.state.players.forEach((p) => {
      p.role = null;
      p.team = null;
      p.color = null;
      p.actions = [];
      p.isAlive = null;
      p.isRevealed = false;
      p.selection = null; // was vote
      p.isConfirmed = false;
      p.activeActions = [];
      p.activeActionTargets = {}; // reset targets
    });
    this.state.day = null;
    this.state.phase = null;

    logger.clear();
    this._broadcastState();
  }

  _broadcastState() {
    broadcast({ type: 'GAME_STATE_UPDATE', payload: this.state.serialize() });
  }
}

export const gameManager = new GameManager();

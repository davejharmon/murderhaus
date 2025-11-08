import { GameState } from './models/GameState.js';
import { broadcast } from './utils/Broadcast.js';

export class GameManager {
  constructor() {
    this.state = new GameState();
  }

  getState() {
    return this.state.serialize();
  }

  addPlayer(ws, id) {
    if (this.state.addPlayer(id)) this.broadcast();
  }

  updatePlayerName({ id, name }) {
    this.state.updatePlayerName(id, name);
    this.broadcast();
  }

  setPlayerRole({ playerId, role }) {
    this.state.setPlayerRole(playerId, role);
    this.broadcast();
  }

  startGame() {
    this.state.startGame();
    this.broadcast();
  }

  setPhase({ phase }) {
    this.state.setPhase(phase);
    this.broadcast();
  }

  startEvent({ eventType, targets }) {
    this.state.startEvent(eventType, targets);
    this.broadcast();
  }

  doAction({ playerId, actionType, targetId }) {
    this.state.doAction(playerId, actionType, targetId);
    this.broadcast();
  }

  confirmAction({ playerId, actionType }) {
    this.state.confirmAction(playerId, actionType);
    this.broadcast();
  }

  endGame() {
    this.state = new GameState();
    this.broadcast();
  }

  resolvePhase() {
    this.state.resolvePhase();
    this.broadcast();
  }

  killPlayer({ playerId }) {
    this.state.killPlayer(playerId);
    this.broadcast();
  }

  revivePlayer({ playerId }) {
    this.state.revivePlayer(playerId);
    this.broadcast();
  }

  broadcast() {
    broadcast({ type: 'GAME_STATE_UPDATE', payload: this.getState() });
  }
}

export const gameManager = new GameManager();

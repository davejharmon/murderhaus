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

  /**
   * Voting Phase — Afternoon
   * Clears existing votes and unlocks everyone eligible to vote
   */
  startVote() {
    logger.log('Beginning vote...', 'game');

    this.state.players.forEach((player) => {
      if (player.isAlive && player.actions.includes('vote')) {
        player.activeActions.push('vote'); // unlock the vote button
        player.vote = null;
        player.isConfirmed = false;
      }
    });

    // Set phase to afternoon
    this.state.setPhase('afternoon');
    this._broadcastState();
  }

  /**
   * Player casts a vote for a target player
   */
  handleVote(voterId, targetId) {
    const voter = this.state.players.find((p) => p.id === voterId);
    const target = this.state.players.find((p) => p.id === targetId);

    if (!voter || !voter.isAlive) return;
    if (!voter.activeActions.includes('vote')) return;
    if (voter.isConfirmed) return; // Can't change after confirmation
    if (!target) return;

    voter.vote = target.id;

    logger.log(
      `${voter.name || `Player ${voter.id}`} voted for ${
        target.name || `Player ${target.id}`
      }`,
      'game'
    );

    this._broadcastState();
  }

  /**
   * Player confirms their vote — locks keypad and turns bulb white
   */
  confirmVote(voterId) {
    const voter = this.state.players.find((p) => p.id === voterId);
    if (!voter || !voter.isAlive) return;
    if (!voter.activeActions.includes('vote')) return;

    voter.isConfirmed = true;

    // remove the completed action only
    const index = voter.activeActions.indexOf('vote');
    if (index !== -1) voter.activeActions.splice(index, 1);

    logger.log(
      `${voter.name || `Player ${voter.id}`} confirmed their vote`,
      'game'
    );

    this._broadcastState();
  }

  /**
   * Murder Phase — Midnight
   * Functionally works like vote, but uses murder actions and colors
   */
  startMurderPhase() {
    logger.log('Beginning murder phase...', 'game');

    this.state.players.forEach((player) => {
      if (player.isAlive && player.actions.includes('murder')) {
        player.activeActions.push('murder'); // unlock murder action
        player.vote = null;
        player.isConfirmed = false;
      }
    });

    this.state.setPhase('midnight');
    this._broadcastState();
  }

  /**
   * Player performs a murder (functionally a vote for midnight)
   */
  handleKill(killerId, targetId) {
    const killer = this.state.players.find((p) => p.id === killerId);
    const target = this.state.players.find((p) => p.id === targetId);

    if (!killer || !killer.isAlive) return;
    if (!killer.activeActions.includes('murder')) return;
    if (!target) return;

    killer.vote = target.id;
    killer.isConfirmed = true;

    // remove the completed action
    const index = killer.activeActions.indexOf('murder');
    if (index !== -1) killer.activeActions.splice(index, 1);

    this.state.recentlyKilled.add(targetId); // mark the target as killed this phase

    logger.log(
      `${killer.name || `Player ${killer.id}`} murdered ${
        target.name || `Player ${target.id}`
      }`,
      'game'
    );

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
      p.activeActions = [];
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

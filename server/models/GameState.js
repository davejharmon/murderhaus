import { Player } from './Player.js';
import { ROLES, ROLE_MINIMUMS, PHASES } from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';
import { ActionManager } from './ActionManager.js';
import { BulbManager } from './BulbManager.js';

export class GameState {
  constructor() {
    this.day = 0;
    this.phase = null; // 'day' | 'night'
    this.players = [];
    this.activeEvent = null;
    this.eventTargets = [];

    this.actionManager = new ActionManager(this);
  }

  // ------------------------
  // Player Management
  // ------------------------
  addPlayer(id) {
    if (this.players.find((p) => p.id === id)) return false;
    this.players.push(new Player(id, 'NORMIE', this));
    return true;
  }

  updatePlayerName(id, name) {
    const p = this.players.find((p) => p.id === id);
    if (!p) return false;
    p.name = name;
    return true;
  }

  setPlayerRole(playerId, roleName) {
    const p = this.players.find((p) => p.id === playerId);
    if (!p) return;

    p.assignRole(roleName, this);
    this.actionManager.refreshAllTargets();

    logger.log(`${p.name} assigned role "${roleName}"`, 'game');
  }

  get alivePlayers() {
    return this.players.filter((p) => p.isAlive);
  }

  killPlayer(playerId) {
    const p = this.players.find((p) => p.id === playerId);
    if (!p) return;

    p.isAlive = false;
    for (const action of Object.values(p.actions)) {
      action.selection = null;
      action.isConfirmed = false;
    }

    logger.log(`${p.name} was killed`, 'game');
  }

  revivePlayer(playerId) {
    const p = this.players.find((p) => p.id === playerId);
    if (!p) return;
    p.isAlive = true;
    logger.log(`${p.name} was revived`, 'game');
  }

  // ------------------------
  // Phase Management
  // ------------------------
  setPhase(phaseName) {
    if (!PHASES.some((p) => p.name === phaseName)) return;
    this.phase = phaseName;

    // Reset per-player selections for new phase
    for (const p of this.alivePlayers) {
      for (const actionName of Object.keys(p.actions)) {
        p.resetAction(actionName);
      }
    }

    this.actionManager.refreshAllTargets();

    logger.log(
      `Phase set to ${phaseName.toUpperCase()} (Day ${this.day})`,
      'game'
    );
  }

  // ------------------------
  // Event Management
  // ------------------------
  startEvent(eventType, targets = []) {
    if (!targets.length) return;
    this.activeEvent = eventType;
    this.eventTargets = [...targets];

    for (const p of this.alivePlayers) {
      for (const actionName of Object.keys(p.actions)) {
        if (actionName === eventType) {
          this.actionManager.refreshTargets(p, actionName);
          p.resetAction(actionName);
        }
      }
    }

    logger.log(
      `Event "${eventType}" started with targets: ${targets.join(', ')}`,
      'game'
    );
  }

  doAction(playerId, actionName, targetId) {
    const p = this.players.find((p) => p.id === playerId);
    if (!p || !p.isAlive) return false;

    if (!p.actions[actionName]) return false;

    p.setSelection(actionName, targetId);
    logger.log(`${p.name} selected ${targetId} for ${actionName}`, 'game');
    return true;
  }

  confirmAction(playerId, actionName) {
    const p = this.players.find((p) => p.id === playerId);
    if (!p || !p.isAlive) return false;

    p.confirmAction(actionName);
    logger.log(
      `${p.name} confirmed ${actionName} -> ${p.actions[actionName]?.selection}`,
      'game'
    );
    return true;
  }

  // ------------------------
  // Start Game / Role Assignment
  // ------------------------
  startGame() {
    if (!this.players.length) return;
    this.day = 1;

    const unassigned = this.players.filter((p) => !p.role);
    const totalPlayers = this.players.length;
    const minRoles = ROLE_MINIMUMS[totalPlayers] || [];

    let idx = 0;
    for (const roleName of minRoles) {
      if (idx >= unassigned.length) break;
      this.setPlayerRole(unassigned[idx].id, roleName);
      idx++;
    }

    for (const p of unassigned.slice(idx)) {
      this.setPlayerRole(p.id, 'NORMIE');
    }

    this.setPhase('day');
    logger.log(`Game started (Day ${this.day}, Phase: ${this.phase})`, 'game');
  }

  // ------------------------
  // Resolve phase actions
  // ------------------------
  resolvePhase() {
    const phaseActions =
      PHASES.find((p) => p.name === this.phase)?.actions || [];
    this.actionManager.resolvePhaseActions(phaseActions);
  }

  // ------------------------
  // Serialization for client
  // ------------------------
  serialize() {
    const bulbManager = new BulbManager(this);
    return {
      day: this.day,
      phase: this.phase,
      activeEvent: this.activeEvent,
      eventTargets: this.eventTargets,
      players: bulbManager.applyBulbColors(this.players),
      history: logger.toHistoryStrings(),
    };
  }
}

import {
  PHASES,
  ROLES,
  ROLE_MINIMUMS,
  ROLE_POOL,
} from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';
import { Player } from './Player.js';
import { BulbManager } from './BulbManager.js';

export class GameState {
  constructor() {
    this.day = null;
    this.phase = null;
    this.players = []; // array of Player instances
    this.recentlyKilled = new Set(); // players killed this phase
    this.recentlyVoted = new Set(); // players who voted this phase
  }

  // ------------------------
  // Player Management
  // ------------------------
  addPlayer(id) {
    if (this.players.find((p) => p.id === id)) return false;
    this.players.push(new Player(id));
    return true;
  }

  updatePlayerName(id, name) {
    const player = this.players.find((p) => p.id === id);
    if (!player) return false;
    player.name = name;
    return true;
  }

  setPlayerRole(playerId, roleName) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    const role = ROLES.find((r) => r.name === roleName);
    if (!role) return;

    player.role = role.name;
    player.team = role.team;
    player.color = role.color;
    player.actions = [...role.actions];
    player.isAlive = true;

    logger.log(
      `${player.name ?? `Player ${player.id}`} assigned role "${roleName}"`,
      'game'
    );
  }

  killPlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.isAlive = false;
      this.recentlyKilled.add(playerId);
    }
  }

  revivePlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.isAlive = true;
      this.recentlyKilled.delete(playerId);
    }
  }

  // ------------------------
  // Game Lifecycle
  // ------------------------
  startGame() {
    if (!this.players.length) return;
    this.day = 1;
    this.phase = PHASES[0];
    this.assignRoles();
  }

  assignRoles() {
    logger.log('Starting game...', 'game');

    const unassigned = this.players.filter((p) => p.role === 'UNKNOWN');
    if (!unassigned.length) return;

    const totalPlayers = this.players.length;
    const minRoles = ROLE_MINIMUMS[totalPlayers] || [ROLE_POOL[0]];

    const roleCounts = {};
    this.players.forEach((p) => {
      if (p.role !== 'UNKNOWN') {
        roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
      }
    });

    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);

    // Assign minimum roles
    minRoles.forEach((roleName) => {
      const assignedCount = roleCounts[roleName] || 0;
      const minCount = minRoles.filter((r) => r === roleName).length;
      const needed = minCount - assignedCount;
      if (needed <= 0) return;

      const available = shuffled.filter((p) => !p.roleAssigned);
      for (let i = 0; i < needed && available.length; i++) {
        const idx = Math.floor(Math.random() * available.length);
        const player = available.splice(idx, 1)[0];
        this.setPlayerRole(player.id, roleName);
        player.roleAssigned = true;
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      }
    });

    // Fallback role
    const fallbackRole = ROLE_POOL[0];
    shuffled.forEach((player) => {
      if (!player.roleAssigned) {
        this.setPlayerRole(player.id, fallbackRole);
        player.roleAssigned = true;
      }
      delete player.roleAssigned;
    });
  }

  setPhase(newPhase) {
    if (!newPhase) {
      const idx = PHASES.indexOf(this.phase);
      newPhase =
        idx === -1 || idx === PHASES.length - 1 ? PHASES[0] : PHASES[idx + 1];

      if (idx === -1 || idx === PHASES.length - 1) {
        this.day = (this.day ?? 0) + 1;
      }
    }

    this.phase = newPhase;
    this.recentlyKilled.clear();
    this.recentlyVoted.clear();

    // Clear activeActions
    this.players.forEach((p) => (p.activeActions = []));

    // Unlock phase-specific actions
    switch (this.phase) {
      case 'afternoon':
        this.players.forEach((p) => {
          if (p.isAlive && p.actions.includes('vote')) {
            p.activeActions.push('vote');
            p.vote = null;
            p.isConfirmed = false;
          }
        });
        logger.log('Voting started', 'game');
        break;

      case 'midnight':
        this.players.forEach((p) => {
          if (p.isAlive && p.actions.includes('murder')) {
            p.activeActions.push('murder');
            p.vote = null;
            p.isConfirmed = false;
          }
        });
        logger.log('Murder phase started', 'game');
        break;

      default:
        break;
    }
  }

  // ------------------------
  // Handle actions (vote/murder)
  // ------------------------
  handleAction(playerId, actionType, targetId) {
    const player = this.players.find((p) => p.id === playerId);
    const target = this.players.find((p) => p.id === targetId);
    if (!player || !player.isAlive) return;
    if (!player.activeActions.includes(actionType)) return;
    if (!target) return;

    player.vote = target.id;

    if (actionType === 'vote') this.recentlyVoted.add(playerId);
    if (actionType === 'murder') this.recentlyKilled.add(playerId);

    // Auto-confirm murder
    if (actionType === 'murder') player.isConfirmed = true;

    // Remove the completed action
    const index = player.activeActions.indexOf(actionType);
    if (index !== -1) player.activeActions.splice(index, 1);
  }

  // ------------------------
  // Helpers
  // ------------------------
  aliveByAction(action) {
    return this.players.filter((p) => p.isAlive && p.actions.includes(action));
  }

  checkMurdererWin() {
    const aliveMurderers = this.aliveByAction('murder').length;
    const aliveNormies = this.aliveByAction('vote').length - aliveMurderers;
    return aliveMurderers >= aliveNormies;
  }

  checkNormieWin() {
    const aliveMurderers = this.aliveByAction('murder').length;
    return aliveMurderers === 0;
  }

  // ------------------------
  // Serialization
  // ------------------------
  serialize() {
    const bulbManager = new BulbManager(this);
    return {
      day: this.day,
      phase: this.phase,
      players: bulbManager.applyBulbColors(this.players),
      history: logger.toHistoryStrings(),
    };
  }
}

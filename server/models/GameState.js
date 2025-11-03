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
    this.recentlyKilled = new Set();
    this.recentlyVoted = new Set();
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
    if (!player) return;
    player.isAlive = false;
    this.recentlyKilled.add(playerId);
    logger.log(`${player.name ?? `Player ${player.id}`} was killed`, 'game');
  }

  revivePlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    player.isAlive = true;
    this.recentlyKilled.delete(playerId);
    logger.log(`${player.name ?? `Player ${player.id}`} was revived`, 'game');
  }

  // ------------------------
  // Game Lifecycle
  // ------------------------
  startGame() {
    if (!this.players.length) return;
    this.day = 1;
    this.phase = PHASES[0];
    this.assignRoles();
    logger.log(`Game started (Day ${this.day}, Phase: ${this.phase})`, 'game');
  }

  assignRoles() {
    logger.log('Assigning roles...', 'game');
    const unassigned = this.players.filter((p) => p.role === null);
    if (!unassigned.length) return;

    const totalPlayers = this.players.length;
    const minRoles = ROLE_MINIMUMS[totalPlayers] || [ROLE_POOL[0]];
    const roleCounts = {};

    this.players.forEach((p) => {
      if (p.role !== null) roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
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

    // Fallback roles
    const fallbackRole = ROLE_POOL[0];
    shuffled.forEach((player) => {
      if (!player.roleAssigned) this.setPlayerRole(player.id, fallbackRole);
      delete player.roleAssigned;
    });
  }

  setPhase(newPhase) {
    if (!newPhase) {
      const idx = PHASES.indexOf(this.phase);
      newPhase =
        idx === -1 || idx === PHASES.length - 1 ? PHASES[0] : PHASES[idx + 1];
      if (idx === -1 || idx === PHASES.length - 1)
        this.day = (this.day ?? 0) + 1;
    }

    this.phase = newPhase;
    this.recentlyKilled.clear();
    this.recentlyVoted.clear();

    // Clear all active actions
    this.players.forEach((p) => (p.activeActions = []));

    // Phase-specific actions
    if (newPhase === 'afternoon') this._startActionPhase('vote');
    if (newPhase === 'midnight') this._startActionPhase('murder');

    logger.log(`Phase updated to: ${this.phase}`, 'game');
  }

  // ------------------------
  // Generic Action Handling
  // ------------------------
  _startActionPhase(actionType) {
    const alivePlayers = this.players.filter((p) => p.isAlive);

    this.players.forEach((player) => {
      if (player.isAlive && player.actions.includes(actionType)) {
        player.activeActions.push(actionType);
        player.selection = null;
        player.isConfirmed = false;

        // Include self in targets for vote
        if (actionType === 'vote') {
          player.activeActionTargets[actionType] = alivePlayers.map(
            (p) => p.id
          );
        } else {
          player.activeActionTargets[actionType] = alivePlayers
            .filter((p) => p.id !== player.id)
            .map((p) => p.id);
        }
      }
    });

    logger.log(`${actionType} phase started`, 'game');
  }

  doAction(playerId, actionType, targetId) {
    const player = this.players.find((p) => p.id === playerId);
    if (
      !player ||
      !player.isAlive ||
      !player.activeActions.includes(actionType)
    )
      return false;

    // Allow deselection (targetId === null)
    if (targetId !== null) {
      if (
        !player.activeActionTargets ||
        !player.activeActionTargets[actionType] ||
        !player.activeActionTargets[actionType].includes(targetId)
      )
        return false;
    }

    player.selection = targetId; // can be null
    player.isConfirmed = false;

    if (targetId === null) {
      logger.log(
        `${player.name ?? `Player ${player.id}`} deselected ${actionType}`,
        'game'
      );
    } else {
      logger.log(
        `${
          player.name ?? `Player ${player.id}`
        } selected ${targetId} for ${actionType}`,
        'game'
      );
    }
    return true;
  }

  confirmAction(playerId, actionType) {
    const player = this.players.find((p) => p.id === playerId);
    if (
      !player ||
      !player.isAlive ||
      !player.activeActions.includes(actionType)
    )
      return false;

    player.isConfirmed = true;

    const idx = player.activeActions.indexOf(actionType);
    if (idx !== -1) player.activeActions.splice(idx, 1);

    logger.log(
      `${player.name ?? `Player ${player.id}`} confirmed ${actionType} (${
        player.selection
      })`,
      'game'
    );
    return true;
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

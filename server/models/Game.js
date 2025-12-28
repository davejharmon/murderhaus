import {
  MAX_PLAYERS,
  PHASES,
  MINIMUM_ROLES,
  ROLES,
  DEFAULT_ROLE,
} from '../../shared/constants.js';
import { Player } from './Player.js';
import { logger } from '../utils/Logger.js';
import { Slide } from './Slide.js';

export class Game {
  constructor() {
    this.players = [];
    this.phaseIndex = 0;
    this.dayCount = 0;
    this.gameStarted = false;
    this.activeEvents = [];
  }

  /** --- Player management --- */
  addPlayer(id) {
    if (this.players.length >= MAX_PLAYERS) {
      return { success: false, message: 'Max players reached' };
    }
    const player = new Player(id, this);
    this.players.push(player);
    return { success: true, message: `Player ${id} registered`, player };
  }

  removePlayer(playerId) {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index === -1) {
      return { success: false, message: `Player ${playerId} not found` };
    }

    const [removed] = this.players.splice(index, 1); // Remove player

    // Optional: cleanup other game state that references this player
    if (this.playersSelecting) {
      delete this.playersSelecting[removed.id];
    }

    // Add more cleanup here if needed (votes, events, etc.)

    return { success: true, message: `Player ${removed.id} has been kicked` };
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id) || null;
  }

  /** Flexible setter for player properties */
  setPlayerProperty(playerId, key, value, inState = false) {
    const player = this.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };
    return player.set(key, value, inState);
  }

  /** --- Phase management --- */
  getCurrentPhase() {
    const phase = PHASES[this.phaseIndex];
    if (!phase) {
      logger.log(
        `Invalid phaseIndex: ${this.phaseIndex}, resetting`,
        'error',
        'Game.getCurrentPhase'
      );
      return { name: null, playerActions: [], hostActions: [], events: [] };
    }
    return phase;
  }

  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
    const phase = this.getCurrentPhase();
    if (phase.name === 'day') this.dayCount++;

    // Reset each player's per-phase state
    this.players.forEach((p) => p.initializePhase());

    return {
      success: true,
      message: `Phase started: Day ${this.dayCount}, ${phase.name}`,
    };
  }

  /** --- Game lifecycle --- */
  start() {
    if (this.gameStarted)
      return { success: false, message: 'Game already started' };
    if (this.players.length < 4)
      return { success: false, message: 'Not enough players' };

    this.gameStarted = true;
    this.dayCount = 1;
    this.phaseIndex = 0;
    const result = this.assignRandomRoles();
    return result;
  }

  assignRandomRoles() {
    const total = this.players.length;
    const minimum = MINIMUM_ROLES[total] || {};
    const rolesToAssign = [];

    // Minimum roles
    Object.entries(minimum).forEach(([roleName, count]) => {
      for (let i = 0; i < count; i++) rolesToAssign.push(ROLES[roleName]);
    });

    // Fill remaining with default role
    while (rolesToAssign.length < total)
      rolesToAssign.push(ROLES[DEFAULT_ROLE]);

    // Shuffle
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [
        rolesToAssign[j],
        rolesToAssign[i],
      ];
    }

    // Assign to players
    this.players.forEach((player, i) => {
      const role = rolesToAssign[i];
      player.assignRole(role.name);
    });
    return { success: true, message: 'All roles assigned.' };
  }

  isGameOver() {
    const werewolvesAlive = this.getPlayersByRole('werewolf').some(
      (p) => p.state.isAlive
    );
    const villagersAlive = this.getPlayersByRole('villager').some(
      (p) => p.state.isAlive
    );
    return !werewolvesAlive || !villagersAlive;
  }
  getPublicState() {
    const phase = this.getCurrentPhase(); // get from PHASES array

    return {
      gameStarted: this.gameStarted,
      dayCount: this.dayCount,
      phase: phase?.name || null,
      players: this.players.map((p) => p.getPublicState()),
      activeEvents: this.activeEvents,
      pendingEvents: this.pendingEvents || [],
      phaseIndex: this.phaseIndex, // optional but useful
    };
  }

  /** --- Getter: all players currently making a selection --- */
  get playersSelecting() {
    const map = {};
    this.players.forEach((p) => {
      p.state.actions.forEach((a) => {
        if (a.active && a.selectedTarget != null) {
          if (!map[a.selectedTarget]) map[a.selectedTarget] = [];
          map[a.selectedTarget].push({ id: p.id, confirmed: a.confirmed });
        }
      });
    });
    return map;
  }

  /** --- Convenience helpers --- */
  getAlivePlayers() {
    return this.players.filter((p) => p.state.isAlive);
  }

  getPlayersByRole(roleName) {
    return this.players.filter((p) => p.role?.name === roleName);
  }

  get alivePlayers() {
    return this.players.filter((p) => p.state.isAlive);
  }

  get deadPlayers() {
    return this.players.filter((p) => !p.state.isAlive);
  }

  getPlayerById(pid) {
    return this.players.find((p) => p?.id === pid);
  }

  playersBy(predicateFn) {
    return this.players.filter(predicateFn);
  }

  playerIDsBy(predicateFn) {
    return this.players.filter(predicateFn).map((p) => p.id);
  }

  playersByTeam(teamName) {
    return this.playersBy((p) => p.team === teamName);
  }

  playerIDsByTeam(teamName) {
    return this.playersByTeam(teamName).map((p) => p.id);
  }

  playersByRole(roleName) {
    return this.playersBy((p) => p.role === roleName);
  }

  playerIDsByRole(roleName) {
    return this.playersByRole(roleName).map((p) => p.id);
  }

  resolveVote(event, fn) {
    const resultsSlide = Slide.voteResults(event);
    const jumpTo = true;
    const frontRunners = event.getFrontrunners().length
      ? event.getFrontrunners()
      : [...event.participants]; // if nobody is a frontrunner, everyone is.

    this.slideManager.push(resultsSlide, jumpTo);
    let result;
    if (frontRunners.length === 1) {
      const player = this.getPlayer(frontRunners[0]);
      const voters = event.getVoterIds(player.id);
      const resolutionDesc = event.eventDef.resolutionDesc;
      this.slideManager.push(
        Slide.playerUpdateWithGallery(player.id, voters, resolutionDesc)
      );
      fn(player); // winner has fn performed.

      this.slideManager.push(
        Slide.playerUpdateWithGallery(player.id, voters, resolutionDesc, true)
      );

      result = {
        success: true,
        message: `${player.name} has been ${event.eventDef.resolutionDesc}`,
      };
    } else {
      const updatedName = !event.eventName.startsWith('TIEBREAK ') // not working for some reason
        ? `TIEBREAK ${event.eventName}`
        : event.eventName;

      this.activeEvents
        .find((e) => e.id === event.id)
        .set({
          targets: frontRunners,
          completedBy: [],
          results: {},
          eventName: updatedName,
        });
      event.participants.forEach((pid) => {
        const player = this.getPlayerById(pid);
        if (!player) return;
        player.updateKeymap(this.activeEvents);
      });

      result = {
        success: false,
        message: `[GAME] ${frontRunners.length} frontrunners: tiebreak vote started.`,
      };
    }
    return result;
  }
}

// /server/GameManager.js
import { Game } from './Game.js';
import { Player } from './Player.js';
import { ACTIONS } from '../../shared/constants/actions.js';
import { EVENTS } from '../../shared/constants/events.js';
import { OUTCOMES } from '../../shared/outcomes.js';
import { Logger } from './utils/Logger.js';

export class GameManager {
  constructor() {
    this.game = new Game();
  }

  // -------------------------
  // Player Management
  // -------------------------
  registerPlayer(playerId) {
    if (this.game.players.has(playerId)) {
      const player = this.game.getPlayerById(playerId);
      Logger.info(`Player reconnected: ${player.name}`, { player });
      return player;
    }

    const player = new Player(playerId);
    this.game.players.set(playerId, player);
    Logger.system(`Player registered: ${player.name}`, { player });
    return player;
  }

  getPlayer(playerId) {
    return this.game.getPlayerById(playerId);
  }

  updatePlayerName(playerId, name) {
    const player = this.getPlayer(playerId);
    if (player) {
      const oldName = player.name;
      player.name = name;
      Logger.info(`Player name updated: ${oldName} → ${name}`, { player });
    }
  }

  updatePlayerImage(playerId, image) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.image = image;
      Logger.info(`Player image updated`, { player });
    }
  }

  // -------------------------
  // Action Handling
  // -------------------------
  hostAction(playerId, actionName) {
    const action = this.game.startAction(playerId, actionName);
    if (action) {
      Logger.info(`Action started: ${actionName}`, {
        player: this.getPlayer(playerId),
      });
    } else {
      Logger.warn(`Failed to start action: ${actionName}`, {
        playerId,
      });
    }
    return action;
  }

  playerInput(playerId, input) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    for (const action of player.actions.values()) {
      if (action.state.active && !action.state.completed) {
        const result = this.game.performActionStep(playerId, action.id, input);
        if (result?.message) {
          Logger.info(`Action step performed: ${action.def.name}`, {
            player,
            result,
          });
        }
      }
    }
  }

  // -------------------------
  // Event Handling
  // -------------------------
  startEvent(eventName, initiatedBy = 'host') {
    const eventDef = EVENTS[eventName];
    if (!eventDef) {
      Logger.warn(`Unknown event: ${eventName}`);
      return null;
    }

    const event = {
      id: `${eventName}-${Date.now()}`,
      def: eventDef,
      state: {
        grants: new Map(),
        inputs: new Map(),
        results: new Map(),
        pendingKills: [],
      },
      resolved: false,
    };

    this.game.startEvent(event);
    Logger.system(`Event started: ${eventName}`, { event, initiatedBy });
    return event;
  }

  resolveEvent(eventId) {
    const event = this.game.getEventById(eventId);
    if (!event) return;

    if (event.def.resolution?.apply) {
      event.def.resolution.apply({
        event,
        game: this.game,
        outcome: ({ actionName, actor, target, item, role, callback }) => {
          const result = OUTCOMES[actionName]?.({
            actor,
            target,
            game: this.game,
            item,
            role,
            callback,
          });
          if (result?.message) Logger.info(result.message, { actor, target });
          return result;
        },
      });
    }

    event.resolved = true;
    this.game.endEvent(event, false);
    Logger.system(`Event resolved: ${event.def.name}`, { event });
  }

  startAllEvents() {
    const activeEvents = [...this.game.events.values()];
    for (const event of activeEvents) {
      if (!event.resolved) {
        this.startEvent(event.def.name, 'system');
      }
    }
    Logger.system(`All events started`);
  }

  resolveAllEvents() {
    const activeEvents = this.game.getActiveEvents();
    for (const event of activeEvents) {
      this.resolveEvent(event.id);
    }
    Logger.system(`All events resolved`);
  }

  clearEvent(eventId) {
    const event = this.game.getEventById(eventId);
    if (!event) return;
    this.game.endEvent(event);
    Logger.system(`Event cleared: ${event.def.name}`, { event });
  }

  // -------------------------
  // Game Phase / Flow
  // -------------------------
  startGame() {
    this.game.gameStarted = true;
    this.game.phaseIndex = 0;
    this.game.dayCount = 0;
    Logger.system(`Game started`);
  }

  nextPhase() {
    const oldPhase = this.game.getCurrentPhase()?.name;
    this.game.phaseIndex = (this.game.phaseIndex + 1) % this.game.phases.length;
    const newPhase = this.game.getCurrentPhase()?.name;
    Logger.system(`Phase changed: ${oldPhase} → ${newPhase}`);
  }
}

export const gameManager = new GameManager();

// /server/GameManager.js
import { Game } from './models/Game.js';
import { Player } from './models/Player.js';
import {
  ACTIONS,
  EVENTS,
  OUTCOMES,
  CHANNELS,
} from '../shared/constants/index.js';
import { logger as Log } from './utils/Logger.js';
import { publish } from './utils/Broadcast.js';

export class GameManager {
  constructor() {
    this.game = new Game();
  }

  update() {
    publish(CHANNELS.GAME_UPDATE, this.game.getPublicState());
    publish(CHANNELS.LOG_UPDATE, Log.getEntries());
  }

  // -------------------------
  // Player Management
  // -------------------------
  registerPlayer(playerId) {
    if (this.game.players.has(playerId)) {
      const player = this.game.getPlayerById(playerId);
      Log.info(`Player reconnected: ${player.name}`, { player });
      this.update();
      return player;
    }

    const player = new Player({ id: playerId });
    this.game.players.set(playerId, player);
    Log.info(`Player registered: ${player.name}`, { player });
    this.update();
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
      Log.info(`Player name updated: ${oldName} → ${name}`, { player });
      this.update();
    }
  }

  updatePlayerImage(playerId, image) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.image = image;
      Log.info(`Player image updated`, { player });
      this.update();
    }
  }

  // -------------------------
  // Action Handling
  // -------------------------
  hostAction(playerId, actionName) {
    const action = this.game.startAction(playerId, actionName);
    if (action) {
      Log.info(`Action started: ${actionName}`, {
        player: this.getPlayer(playerId),
      });
    } else {
      Log.warn(`Failed to start action: ${actionName}`, {
        playerId,
      });
    }
    this.update();
    return action;
  }

  playerInput(playerId, input) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    for (const action of player.actions.values()) {
      if (action.state.active && !action.state.completed) {
        const result = this.game.performActionStep(playerId, action.id, input);
        if (result?.message) {
          Log.info(`Action step performed: ${action.def.name}`, {
            player,
            result,
          });
        }
      }
    }
    this.update();
  }

  // -------------------------
  // Event Handling
  // -------------------------
  startEvent(eventName, initiatedBy = 'host') {
    const eventDef = EVENTS[eventName];
    if (!eventDef) {
      Log.warn(`Unknown event: ${eventName}`);
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
    Log.system(`Event started: ${eventName}`, { event, initiatedBy });
    this.update();
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
          if (result?.message) Log.info(result.message, { actor, target });
          this.update();
          return result;
        },
      });
    }

    event.resolved = true;
    this.game.endEvent(event, false);
    Log.system(`Event resolved: ${event.def.name}`, { event });
    this.update();
  }

  startAllEvents() {
    const activeEvents = [...this.game.events.values()];
    for (const event of activeEvents) {
      if (!event.resolved) {
        this.startEvent(event.def.name, 'system');
      }
    }
    Log.system(`All events started`);
    this.update();
  }

  resolveAllEvents() {
    const activeEvents = this.game.getActiveEvents();
    for (const event of activeEvents) {
      this.resolveEvent(event.id);
    }
    Log.system(`All events resolved`);
    this.update();
  }

  clearEvent(eventId) {
    const event = this.game.getEventById(eventId);
    if (!event) return;
    this.game.endEvent(event);
    Log.system(`Event cleared: ${event.def.name}`, { event });
    this.update();
  }

  // -------------------------
  // Game Phase / Flow
  // -------------------------
  startGame() {
    this.game.gameStarted = true;
    this.game.phaseIndex = 0;
    // Assign players without roles roles

    Log.system(`Game started`);
    this.update();
  }

  nextPhase() {
    const oldPhase = this.game.getPhase();
    this.phaseIndex++;
    const newPhase = this.game.getPhase();
    this.game.phase = newPhase;
    Log.system(`Phase changed: ${oldPhase.name} → ${newPhase.name}`);
    this.update();
  }
}

export const gameManager = new GameManager();

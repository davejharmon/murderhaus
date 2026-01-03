import { Game } from './models/Game.js';
import { Player } from './models/Player.js';
import { CHANNELS, HOST_CONTROLS } from '../shared/constants/index.js';
import { logger as Log } from './utils/Logger.js';
import { publish } from './utils/Broadcast.js';
import { EventManager } from './managers/EventManager.js';
import { PhaseManager } from './managers/PhaseManager.js';

export class GameManager {
  constructor() {
    this.game = new Game();
    // this.gameLogic = new GameLogicManager(this.game);
    // this.hostManager = new HostManager(this);
    this.eventManager = new EventManager(this);
    this.phaseManager = new PhaseManager(this);
  }

  update({ events = false, controls = false } = {}) {
    if (events) this.eventManager.update();
    if (controls)
      this.game.players.forEach((player) => {
        player.updateHostControls();
      });
    publish(CHANNELS.GAME_UPDATE, this.game.getPublicState());
    publish(CHANNELS.LOG_UPDATE, Log.getEntries());
  }

  // -------------------------
  // Player management
  // -------------------------
  registerPlayer(playerId) {
    if (this.game.players.has(playerId)) {
      const player = this.game.getPlayerById(playerId);
      Log.system(`Player reconnected: ${player.name}`, { player });
      this.update();
      return player;
    }
    const player = new Player({ id: playerId });
    this.game.players.set(playerId, player);
    Log.system(`Player registered: ${player.name}`, { player });
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
      Log.info('Player image updated', { player });
      this.update();
    }
  }

  // -------------------------
  // Host actions
  // -------------------------
  hostControl(id, ctx) {
    const control = HOST_CONTROLS[id];
    control.execute(this, ctx);
    this.update();
  }

  // -------------------------
  // Player input
  // -------------------------
  playerInput(playerId, input) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    for (const action of player.actions.values()) {
      if (action.state.active && !action.state.completed) {
        const result = this.game.performActionStep(playerId, action.id, input);
        if (result?.message)
          Log.info(`Action step performed: ${action.def.name}`, {
            player,
            result,
          });
      }
    }
    this.update();
  }

  // -------------------------
  // Event management
  // -------------------------
  startEvent(eventName, initiatedBy = 'host') {
    return this.eventManager.startEvent(eventName, initiatedBy);
  }

  resolveEvent(eventId) {
    return this.eventManager.resolveEvent(eventId);
  }

  startAllEvents() {
    this.eventManager.startAllEvents();
  }

  resolveAllEvents() {
    this.eventManager.resolveAllEvents();
  }

  clearEvent(eventId) {
    this.eventManager.clearEvent(eventId);
  }
}

export const gameManager = new GameManager();

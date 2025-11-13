// server/GameManager.js
import { Game } from './models/Game.js';
import { ActionManager } from './managers/ActionManager.js';
import { HostManager } from './managers/HostManager.js';
import { EventManager } from './managers/EventManager.js';
import { ViewManager } from './managers/ViewManager.js';
import { logger } from './utils/Logger.js';

class GameManager {
  constructor() {
    this.game = new Game();
    this.actions = new ActionManager(this.game);
    this.host = new HostManager(this.game);
    this.events = new EventManager(this.game);
    this.view = new ViewManager(this.game);
  }

  handleActionResult(
    result,
    { player = null, type = 'system', updateView = true } = {}
  ) {
    if (result.message)
      logger.log(result.message, result.success === false ? 'warn' : type);

    if (updateView) {
      this.view.publishLog();
      this.view.updatePlayerViews();
      this.view.publishGameMeta();
    }

    if (player) this.view.publishPlayer(player);
  }

  /** --- Game lifecycle --- */
  registerPlayer(id) {
    const result = this.game.addPlayer(id);
    this.handleActionResult(result, { player: result.player });
    return result.player;
  }

  removePlayer(id) {
    const player = this.game.getPlayer(id);
    const result = this.game.removePlayer(id);
    this.handleActionResult(result, { player });
  }

  /** --- Player management --- */
  updatePlayerName(pid, name) {
    const player = this.game.getPlayer(pid);
    const result = this.game.updatePlayerName(pid, name);
    this.handleActionResult(result, { player });
    return result;
  }

  startGame() {
    const result = this.game.start();

    // Update players now that roles are assigned
    this.game.players.forEach((p) =>
      p.update({
        phaseName: this.game.getCurrentPhase().name,
        gameStarted: true,
        game: this.game,
      })
    );

    // Initialize events after players have actions
    this.events.initPendingHostEvents();
    this.view.setEvents(this.events);

    // Publish player state + game meta to clients
    this.view.updatePlayerViews();

    // Log the result without triggering another update
    this.handleActionResult(result, { updateView: false });
  }

  nextPhase() {
    const result = this.game.nextPhase();
    this.events.initPendingHostEvents();
    this.game.players.forEach((p) =>
      p.update({
        phaseName: this.game.getCurrentPhase().name,
        gameStarted: true,
        game: this.game,
      })
    );
    this.handleActionResult(result);
  }

  endGame() {
    this.game = new Game();
    this.view.publishAllPlayers();
    this.view.publishGameMeta();
    this.view.publishLog();
  }

  /** --- Player actions --- */
  playerAction(pid, type, targetId) {
    const result = this.actions.performAction(pid, type, targetId);
    this.handleActionResult(result, { player: this.game.getPlayer(pid) });
  }

  playerConfirm(pid, type) {
    const result = this.actions.confirmAction(pid, type);
    this.handleActionResult(result, { player: this.game.getPlayer(pid) });
  }

  playerInterrupt(pid, name) {
    const result = this.actions.performInterrupt(pid, name);
    this.handleActionResult(result, { player: this.game.getPlayer(pid) });
  }

  /** --- Host actions --- */
  hostAction(pid, action) {
    const result = this.host.performHostAction(pid, action);
    this.handleActionResult(result, { player: this.game.getPlayer(pid) });
  }

  /** --- Events --- */
  startEvent(actionName, initiatedBy = 'host') {
    const result = this.events.startAction(actionName, initiatedBy);
    this.handleActionResult(result);
  }

  resolveEvent(actionName) {
    const result = this.events.resolveEvent(actionName);
    this.handleActionResult(result);
  }
}

export const gameManager = new GameManager();

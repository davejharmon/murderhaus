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
    if (player) this.view.publishPlayer(player);
    if (updateView) this.view.updatePlayerViews();
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
  startGame() {
    const result = this.game.start();
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

  nextPhase() {
    const result = this.game.nextPhase();
    this.handleActionResult(result);
  }
  setPhase(name) {
    const idx = this.game.phaseIndex;
    this.game.phaseIndex = this.game.phaseIndex;
    this.handleActionResult({ success: true, message: `Phase set to ${name}` });
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
  startSelection(action) {
    const result = this.events.startSelection(action);
    this.handleActionResult(result);
  }
  revealSelection(action) {
    const result = this.events.revealSelection(action);
    this.handleActionResult(result);
  }
  resolveLastEvent() {
    return this.events.resolveLastEvent();
  }
}

export const gameManager = new GameManager();

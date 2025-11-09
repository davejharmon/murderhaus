// /server/GameManager.js
import { Game } from './models/Game.js';
import { publish } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';
import { PHASES } from '../shared/constants.js';

class GameManager {
  constructor() {
    this.game = new Game();
  }

  /** --- Helper to handle logging & publishing --- */
  handleActionResult(
    result,
    { player = null, type = 'system', updateView = true } = {}
  ) {
    if (result.message) {
      logger.log(result.message, result.success === false ? 'warn' : type);
    }

    if (player) this.publishPlayerSlice(player);

    if (updateView) {
      this.updatePlayerViewState();
      this.publishPlayersSlice();
      this.publishGameMeta();
      this.publishLog();
    }
  }

  /** --- Basic getters --- */
  getState() {
    return this.game.getState();
  }

  getPlayer(id) {
    return this.game.getPlayer(id);
  }

  /** --- Game lifecycle --- */
  registerPlayer(id) {
    const result = this.game.addPlayer(id);
    const player = result.player ?? null;
    this.handleActionResult(result, { player, type: 'player' });
    return player;
  }

  removePlayer(id) {
    const player = this.getPlayer(id);
    const result = this.game.removePlayer(id);
    this.handleActionResult(result, { player, type: 'player' });
  }

  startGame() {
    const result = this.game.start();
    this.handleActionResult(result, { type: 'system' });
  }

  endGame() {
    this.game = new Game();
    logger.log('Game ended', 'system');
    this.publishPlayersSlice();
    this.publishGameMeta();
    this.publishLog();
  }

  nextPhase() {
    const result = this.game.nextPhase();
    this.handleActionResult(result, { type: 'system' });
  }

  setPhase(phaseName) {
    const phaseIndex = PHASES.findIndex((p) => p.name === phaseName);
    if (phaseIndex === -1) return;
    this.game.phaseIndex = phaseIndex;
    this.handleActionResult(
      { success: true, message: `Phase manually set to ${phaseName}` },
      { type: 'system' }
    );
  }

  /** --- Host actions --- */
  hostAction(playerId, action) {
    const result = this.game.hostAction(playerId, action);
    const player = this.getPlayer(playerId);
    this.handleActionResult(result, { player, type: 'system' });
  }

  /** --- Player actions --- */
  playerAction(playerId, actionType, targetId) {
    const player = this.getPlayer(playerId);
    if (!player)
      return this.handleActionResult(
        { success: false, message: `Player ${playerId} not found` },
        { type: 'warn', updateView: false }
      );

    if (!player.availableActions.some((a) => a.name === actionType))
      return this.handleActionResult(
        {
          success: false,
          message: `Invalid action: ${actionType} for player ${playerId}`,
        },
        { type: 'warn', updateView: false }
      );

    player.selections[actionType] = targetId;
    this.handleActionResult(
      {
        success: true,
        message: `Player ${playerId} selected ${targetId} for ${actionType}`,
      },
      { player, type: 'player', updateView: false }
    );

    // Only publish slices, full view update not needed
    this.publishPlayersSlice();
  }

  playerConfirm(playerId, actionType) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    const selection = player.selections[actionType];
    if (selection == null) return;

    player.confirmedSelections[actionType] = selection;
    this.handleActionResult(
      { success: true, message: `Player ${playerId} confirmed ${actionType}` },
      { player, type: 'player' }
    );
  }

  playerInterrupt(playerId, actionName) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.interruptUsedMap = player.interruptUsedMap || {};
    if (player.interruptUsedMap[actionName]) {
      return this.handleActionResult(
        {
          success: false,
          message: `Player ${playerId} tried to use ${actionName} but it's already used`,
        },
        { type: 'warn', updateView: false }
      );
    }

    player.interruptUsedMap[actionName] = true;
    this.handleActionResult(
      {
        success: true,
        message: `Player ${playerId} used interrupt ${actionName}`,
      },
      { player, type: 'player' }
    );
  }

  /** --- Player view state --- */
  updatePlayerViewState() {
    const phaseName = this.game.getCurrentPhase().name;
    const gameStarted = this.game.gameStarted;

    this.game.players.forEach((player) => {
      player.update({ phaseName, gameStarted });
      this.publishPlayerSlice(player);
    });

    this.publishPlayersSlice();
    this.publishGameMeta();
  }

  /** --- Publishers --- */
  publishPlayerSlice(player) {
    if (!player) return;
    publish(`PLAYER_UPDATE:${player.id}`, player.getPublicState());
  }

  publishPlayersSlice() {
    const allPlayers = this.game.players.map((p) => p.getPublicState());
    publish('PLAYERS_UPDATE', allPlayers);
  }

  publishGameMeta() {
    const meta = {
      phase: this.game.getCurrentPhase().name,
      gameStarted: this.game.gameStarted,
      dayCount: this.game.dayCount ?? 0,
    };
    publish('GAME_META_UPDATE', meta);
  }

  publishLog() {
    publish('LOG_UPDATE', logger.getEntries());
  }
}

export const gameManager = new GameManager();

// /server/GameManager.js
import { Game } from './models/Game.js';
import { publish } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';
import { PHASES, ACTIONS } from '../shared/constants.js';

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
  getPlayer(id) {
    return this.game.getPlayer(id);
  }

  updatePlayerName(id, name) {
    const result = this.game.updatePlayerName(id, name);
    const player = this.getPlayer(id);
    this.handleActionResult(result, { player, type: 'player' });
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
    this.game.players.forEach((player) => {
      player.actionUsage = {};
      player.interruptUsedMap = {};
    });
    this.handleActionResult(result, { type: 'system' });
  }

  setPhase(phaseName) {
    const phaseIndex = PHASES.findIndex((p) => p.name === phaseName);
    if (phaseIndex === -1) return;
    this.game.phaseIndex = phaseIndex;

    this.game.players.forEach((player) => {
      player.actionUsage = {};
      player.interruptUsedMap = {};
    });

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

    const actionDef = ACTIONS[actionType];
    if (!actionDef)
      return this.handleActionResult(
        { success: false, message: `Unknown action type: ${actionType}` },
        { type: 'warn', updateView: false }
      );

    if (!player.availableActions.some((a) => a.name === actionType))
      return this.handleActionResult(
        {
          success: false,
          message: `Action ${actionType} not available for player ${playerId}`,
        },
        { type: 'warn', updateView: false }
      );

    player.actionUsage = player.actionUsage || {};
    const usedCount = player.actionUsage[actionType] || 0;
    if (usedCount >= actionDef.maxPerPhase)
      return this.handleActionResult(
        {
          success: false,
          message: `Player ${playerId} already used ${actionType} this phase`,
        },
        { type: 'warn', updateView: false }
      );

    if (!actionDef.conditions(player, this.game, this.getPlayer(targetId)))
      return this.handleActionResult(
        {
          success: false,
          message: `Conditions not met for ${actionType} by player ${playerId}`,
        },
        { type: 'warn', updateView: false }
      );

    player.selections[actionType] = targetId;
    player.actionUsage[actionType] = usedCount + 1;

    this.handleActionResult(
      {
        success: true,
        message: `Player ${playerId} selected ${targetId} for ${actionType}`,
      },
      { player, type: 'player', updateView: false }
    );

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

    const actionDef = ACTIONS[actionName];
    if (!actionDef || actionDef.type !== 'interrupt')
      return this.handleActionResult(
        {
          success: false,
          message: `Unknown or invalid interrupt: ${actionName}`,
        },
        { type: 'warn', updateView: false }
      );

    player.interruptUsedMap = player.interruptUsedMap || {};
    if (player.interruptUsedMap[actionName])
      return this.handleActionResult(
        {
          success: false,
          message: `Player ${playerId} already used ${actionName}`,
        },
        { type: 'warn', updateView: false }
      );

    if (!actionDef.conditions(player, this.game))
      return this.handleActionResult(
        {
          success: false,
          message: `Conditions not met for interrupt ${actionName}`,
        },
        { type: 'warn', updateView: false }
      );

    player.interruptUsedMap[actionName] = true;
    player.actionUsage = player.actionUsage || {};
    player.actionUsage[actionName] = (player.actionUsage[actionName] || 0) + 1;

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
    if (!this.game || !Array.isArray(this.game.players)) {
      logger.log(
        `updatePlayerViewState() called but game or players is undefined`,
        'error',
        'GameManager.updatePlayerViewState'
      );
      return;
    }

    const phase = this.game.getCurrentPhase?.() ?? { name: null };
    const phaseName = phase.name;
    const gameStarted = this.game.gameStarted ?? false;

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
    if (!this.game || !Array.isArray(this.game.players)) {
      return publish('PLAYERS_UPDATE', []);
    }

    const allPlayers = this.game.players.map((p) =>
      p.getPublicState ? p.getPublicState() : p
    );
    publish('PLAYERS_UPDATE', allPlayers);
  }

  publishGameMeta() {
    if (!this.game) {
      logger.log(
        `publishGameMeta() called but game is undefined`,
        'error',
        'GameManager.publishGameMeta'
      );
      return publish('GAME_META_UPDATE', {
        phase: null,
        gameStarted: false,
        dayCount: 0,
      });
    }

    const phase = this.game.getCurrentPhase?.() ?? { name: null };

    publish('GAME_META_UPDATE', {
      phase: phase.name ?? null,
      gameStarted: this.game.gameStarted ?? false,
      dayCount: this.game.dayCount ?? 0,
    });
  }

  publishLog() {
    publish('LOG_UPDATE', logger.getEntries());
  }
}

export const gameManager = new GameManager();

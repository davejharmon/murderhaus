import { publish } from '../utils/Broadcast.js';
import { logger } from '../utils/Logger.js';

export class ViewManager {
  constructor(game) {
    this.game = game;
  }

  setEvents(events) {
    this.events = events;
  }

  publishPlayer(player) {
    if (!player) return;
    publish(`PLAYER_UPDATE:${player.id}`, player.getPublicState());
  }

  publishAllPlayers() {
    const all = this.game.players.map((p) => p.getPublicState());
    publish('PLAYERS_UPDATE', all);
  }

  publishGameMeta() {
    const gameState = this.game.getPublicState();
    publish('GAME_META_UPDATE', {
      ...gameState,
      pendingEvents: this.events?.getPendingEvents?.() ?? [],
    });
  }

  publishLog() {
    publish('LOG_UPDATE', logger.getEntries());
  }

  updatePlayerViews() {
    // Since Player.update is gone, just publish current state
    this.game.players.forEach((p) => this.publishPlayer(p));
    this.publishAllPlayers();
    this.publishGameMeta();
  }
}

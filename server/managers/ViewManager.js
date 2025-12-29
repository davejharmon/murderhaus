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
  d;

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

  publishSlides(slideSlice) {
    // slideSlice should be { buffer, active }
    if (!slideSlice) return;
    publish('SLIDES_UPDATE', slideSlice);
  }

  updatePlayerViews() {
    // Since Player.update is gone, just publish current state
    this.game.players.forEach((p) => this.publishPlayer(p));
    this.publishAllPlayers();
    this.publishGameMeta();
  }
}

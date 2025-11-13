// server/managers/ViewManager.js
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
    this.publishAllPlayers();
  }

  publishAllPlayers() {
    const all = this.game.players.map((p) => p.getPublicState());
    publish('PLAYERS_UPDATE', all);
  }

  publishGameMeta() {
    const phase = this.game.getCurrentPhase?.() ?? { name: null };
    const pendingEvents = this.events?.getPendingEvents?.() ?? [];
    console.log(
      '[DEBUG] Publishing GAME_META_UPDATE, pendingEvents:',
      pendingEvents
    );
    publish('GAME_META_UPDATE', {
      phase: phase.name,
      gameStarted: this.game.gameStarted,
      dayCount: this.game.dayCount,
      currentEvents: this.game.currentEvents,
      pendingEvents,
    });
  }

  publishLog() {
    publish('LOG_UPDATE', logger.getEntries());
  }

  updatePlayerViews() {
    const phase = this.game.getCurrentPhase();
    const started = this.game.gameStarted;

    this.game.players.forEach((p) => {
      p.update({
        phaseName: phase.name,
        gameStarted: started,
        game: this.game,
      });
      this.publishPlayer(p); // 👈 Publish each player individually
    });

    this.publishGameMeta();
  }
}

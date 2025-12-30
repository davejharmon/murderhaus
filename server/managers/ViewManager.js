import { publish } from '../utils/Broadcast.js';
import { logger as Log } from '../utils/Logger.js';
import { CHANNELS } from '../../shared/constants/config.js';

export class ViewManager {
  constructor(game) {
    this.game = game;
  }

  // Publish a single player's public state to their namespaced channel
  publishPlayerState(player) {
    if (!player) return;
    publish(CHANNELS.playerUpdate(player.id), player.getPublicState());
  }

  // Publish the full game state to GAME_UPDATE channel
  publishGameState() {
    publish(CHANNELS.GAME_UPDATE, this.game.getPublicState());
  }

  // Publish the current log entries
  publishLog() {
    publish(CHANNELS.LOG_UPDATE, Log.getEntries());
  }

  // Publish the current slide slice
  publishSlides(slideSlice) {
    if (!slideSlice) return;
    publish(CHANNELS.SLIDES_UPDATE, slideSlice);
  }

  // Publish all player states individually and the overall game state
  updateAllPlayers() {
    for (const player of this.game.players.values()) {
      this.publishPlayerState(player);
    }
    this.publishGameState();
  }
}

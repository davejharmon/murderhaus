import { MAX_PLAYERS, PHASES } from '../../shared/constants.js';
import { Player } from './Player.js';

export class GameState {
  constructor() {
    this.phase = null;
    this.day = null;
    this.players = []; // start empty
  }

  // Derived property for compatibility with broadcast / UI
  get history() {
    return logger.toHistoryStrings();
  }

  addPlayer(id) {
    if (this.players.find((p) => p.id === id)) return false;

    const newPlayer = new Player(id);
    this.players.push(newPlayer);
    return true;
  }

  updatePlayerName(id, name) {
    const p = this.players.find((p) => p.id === id);
    if (!p) return false;

    p.name = name;
    return true;
  }

  startGame() {
    this.day = 1;
    this.phase = PHASES[0];
  }

  setPhase(newPhase) {
    if (!newPhase) {
      const currentIndex = PHASES.indexOf(this.phase);
      newPhase =
        currentIndex === -1 || currentIndex === PHASES.length - 1
          ? PHASES[0]
          : PHASES[currentIndex + 1];

      if (currentIndex === -1 || currentIndex === PHASES.length - 1) {
        this.day = (this.day ?? 0) + 1;
      }
    }

    this.phase = newPhase;
  }
}

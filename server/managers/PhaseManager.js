import { logger as Log } from '../utils/Logger.js';

export class PhaseManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  startGame() {
    const gm = this.gameManager;
    gm.game.gameStarted = true;
    gm.game.phaseIndex = 0;
    Log.system('[PHASE_MGR] Game started');
    gm.update({ events: true });
  }

  nextPhase() {
    const gm = this.gameManager;
    const oldPhase = gm.game.getPhase();
    gm.game.phaseIndex++;
    const newPhase = gm.game.getPhase();
    Log.system(
      `[PHASE_MGR] Phase changed: ${oldPhase?.name ?? 'None'} → ${
        newPhase.name
      }`
    );
    gm.update({ events: true });
  }
}

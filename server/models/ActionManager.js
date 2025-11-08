import { ACTIONS } from '../../shared/constants.js';

export class ActionManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /** -----------------
   * Update valid targets for all players for all actions
   * Should be called whenever phase changes or game state changes
   * ----------------- */
  refreshAllTargets() {
    for (const player of this.gameState.players) {
      for (const actionName of Object.keys(player.actions)) {
        this.refreshTargets(player, actionName);
      }
    }
  }

  /** -----------------
   * Refresh valid targets for a specific player action
   * ----------------- */
  refreshTargets(player, actionName) {
    const actionDef = ACTIONS[actionName];
    const action = player.actions[actionName];
    if (!action || !actionDef) return;

    action.validTargets = actionDef.getValidTargets(this.gameState, player);

    // If the current selection is no longer valid, reset it
    if (
      action.selection != null &&
      !action.validTargets.includes(action.selection)
    ) {
      action.selection = null;
      action.isConfirmed = false;
    }
  }

  /** -----------------
   * Get valid targets dynamically
   * ----------------- */
  getValidTargets(player, actionName) {
    this.refreshTargets(player, actionName);
    return player.actions[actionName]?.validTargets || [];
  }

  /** -----------------
   * Resolve an action (only confirmed actions)
   * ----------------- */
  resolveAction(player, actionName) {
    const action = player.actions[actionName];
    if (!action || !action.isConfirmed || action.quantity <= 0) return;

    switch (actionName) {
      case 'vote':
        // Voting resolution happens elsewhere (GameState.revealEvent)
        break;
      case 'murder':
        this._handleMurder(player, action.selection);
        break;
      case 'save':
        this._handleSave(player, action.selection);
        break;
      case 'investigate':
        this._handleInvestigate(player, action.selection);
        break;
      default:
        console.warn(`No handler for action: ${actionName}`);
    }

    if (action.quantity !== Infinity) action.quantity -= 1;
    action.selection = null;
    action.isConfirmed = false;
  }

  /** -----------------
   * Resolve all actions for the current phase
   * ----------------- */
  resolvePhaseActions(actionNames) {
    for (const player of this.gameState.players) {
      for (const actionName of actionNames) {
        if (player.actions[actionName]?.isConfirmed) {
          this.resolveAction(player, actionName);
        }
      }
    }
  }

  /** -----------------
   * Action Handlers
   * ----------------- */
  _handleMurder(player, targetId) {
    const target = this.gameState.players.find((p) => p.id === targetId);
    if (target && target.isAlive) {
      target.isAlive = false;
      console.log(`${player.name} murdered ${target.name}`);
    }
  }

  _handleSave(player, targetId) {
    const target = this.gameState.players.find((p) => p.id === targetId);
    if (target && !target.isAlive) {
      target.isAlive = true;
      console.log(`${player.name} saved ${target.name}`);
    }
  }

  _handleInvestigate(player, targetId) {
    const target = this.gameState.players.find((p) => p.id === targetId);
    if (target) {
      console.log(
        `${player.name} investigated ${target.name}: role=${target.role}`
      );
      // Could store results in player.hostActions or GameState logs
    }
  }
}

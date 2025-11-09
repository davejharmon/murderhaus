// server/models/Player.js
import { ROLES, PHASES, PREGAME_HOST_ACTIONS } from '../../shared/constants.js';

export class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player ${id}`;

    // Role & team identity
    this.role = null;
    this.team = null;
    this.color = '#666';

    // Game state
    this.isAlive = true;

    // Action state
    this.actions = []; // all actions (strings)
    this.availableActions = []; // subset allowed in current phase
    this.selections = {}; // { actionName: targetId }
    this.confirmedSelections = {}; // { actionName: boolean }

    // Host controls
    this.hostActions = []; // e.g. ['kick','kill','revive']
  }

  /** Assign a role to the player */
  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role) throw new Error(`Role ${roleName} does not exist`);

    this.role = role;
    this.team = role.team;
    this.color = role.color;
    this.actions = [...role.defaultActions];

    // Initialize selection state
    this.selections = {};
    this.confirmedSelections = {};
    this.actions.forEach((action) => {
      this.selections[action] = null;
      this.confirmedSelections[action] = false;
    });
  }

  /**
   * Update per-phase UI logic
   * Called centrally from GameManager.updatePlayerViewState()
   */
  update({ phaseName, gameStarted }) {
    const phase = PHASES.find((p) => p.name === phaseName);

    // Update available actions for this phase
    this.availableActions = phase
      ? this.actions.filter((a) => phase.validActions.includes(a))
      : [];

    // Update host actions shown on dashboard
    if (!gameStarted) {
      this.hostActions = [...PREGAME_HOST_ACTIONS];
    } else if (phase) {
      this.hostActions = phase.validHostActions.filter((a) => {
        if (a === 'kill') return this.isAlive;
        if (a === 'revive') return !this.isAlive;
        return true;
      });
    } else {
      this.hostActions = [];
    }
  }

  /** Select a target for a specific action */
  handleSelection(value, actionName) {
    if (!this.availableActions.includes(actionName)) return;
    this.selections[actionName] = value;
    this.confirmedSelections[actionName] = false;
  }

  /** Confirm a previously selected action */
  handleConfirm(actionName) {
    const selection = this.selections[actionName];

    // Must check specifically for null/undefined — allow targetId = 0
    if (selection == null) return;

    this.confirmedSelections[actionName] = true;
  }

  /** Attempt to interrupt */
  handleInterrupt(actionName) {
    const interruptable = this.availableActions.filter(
      (a) =>
        a === 'interrupt' || (typeof a === 'object' && a.type === 'interrupt')
    );

    if (interruptable.length === 0) return false;

    const action = actionName
      ? interruptable.find((a) => a === actionName || a.name === actionName)
      : interruptable[0];

    if (!action) return false;

    if (this.onInterrupt) this.onInterrupt(this, action);
    return true;
  }

  registerInterruptCallback(callback) {
    this.onInterrupt = callback;
  }

  /** Public state projection (used by Game.getState) */
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      role: this.role?.name ?? null, // optionally hide client role later
      team: this.team?.name ?? null,
      color: this.color,
      isAlive: this.isAlive,
      actions: this.actions,
      availableActions: this.availableActions,
      hostActions: this.hostActions,
      selections: this.selections,
      confirmedSelections: this.confirmedSelections,
    };
  }
}

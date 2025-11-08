import { ROLES, PHASES, PREGAME_HOST_ACTIONS } from '../../shared/constants.js';

export class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player ${id}`;
    this.role = null;
    this.team = null;
    this.color = '#666';

    // UI state
    this.uiState = {
      color: '#00cc00',
      animation: null,
      queuedAnimations: [],
    };

    // Game state
    this.isAlive = true;

    // Actions
    this.actions = []; // all actions for this player
    this.availableActions = []; // filtered per current phase
    this.selections = {}; // track selection per action
    this.confirmedSelections = {}; // track confirmation per action

    // Host actions (for dashboard control)
    this.hostActions = []; // dynamically set based on game state

    // Button map
    this.buttons = {
      0: () => this.handleSelection(0),
      1: () => this.handleSelection(1),
      2: () => this.handleSelection(2),
      3: () => this.handleSelection(3),
      4: () => this.handleSelection(4),
      5: () => this.handleSelection(5),
      6: () => this.handleSelection(6),
      7: () => this.handleSelection(7),
      8: () => this.handleSelection(8),
      9: () => this.handleSelection(9),
      confirm: () => this.handleConfirm(),
      interrupt: () => this.handleInterrupt(),
    };
  }

  /** Assign a role to the player */
  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role) throw new Error(`Role ${roleName} does not exist`);

    this.role = role;
    this.team = role.team;
    this.color = role.color;
    this.actions = [...role.defaultActions];

    // Initialize selections & confirmed state for each action
    role.defaultActions.forEach((action) => {
      this.selections[action] = null;
      this.confirmedSelections[action] = false;
    });
  }

  /**
   * Unified state update
   * @param {Object} options
   * @param {string} options.phaseName - current phase of the game
   * @param {boolean} options.gameStarted - is the game running
   */
  update({ phaseName, gameStarted }) {
    const phase = PHASES.find((p) => p.name === phaseName);

    // Update available player actions
    if (!phase) {
      this.availableActions = [];
    } else {
      this.availableActions = this.actions.filter((a) =>
        phase.validActions.includes(a)
      );
    }

    // Update host actions
    if (!gameStarted) {
      this.hostActions = [...PREGAME_HOST_ACTIONS]; // e.g. ['kick', 'assign']
    } else if (phase) {
      this.hostActions = phase.validHostActions.filter((a) => {
        if (a === 'kill') return this.isAlive; // can only kill alive players
        if (a === 'revive') return !this.isAlive; // can only revive dead players
        return true;
      });
    } else {
      this.hostActions = [];
    }
  }

  /** Generic selection handler */
  handleSelection(value, actionName = 'vote') {
    if (!this.availableActions.includes(actionName)) return;
    this.selections[actionName] = value;
    this.confirmedSelections[actionName] = false;
  }

  /** Confirm selection */
  handleConfirm(actionName = 'vote') {
    if (!this.selections[actionName]) return;
    this.confirmedSelections[actionName] = true;
  }

  /** Generic interrupt handler */
  handleInterrupt(interruptActionName = null) {
    const interruptableActions = this.availableActions.filter(
      (a) => a === 'interrupt' || a.type === 'interrupt'
    );
    if (interruptableActions.length === 0) return false;

    let action = interruptActionName
      ? interruptableActions.find((a) => a === interruptActionName)
      : interruptableActions[0];

    if (!action) return false;

    if (this.onInterrupt) this.onInterrupt(this, action);
    return true;
  }

  /** Register a callback to handle interrupts */
  registerInterruptCallback(callback) {
    this.onInterrupt = callback;
  }
}

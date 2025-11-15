import { ACTIONS, ROLES, TEAMS, PHASES } from '../../shared/constants.js';

export class Player {
  constructor(id) {
    this.id = id; // assigned on join
    this.name = `Player ${id}`; // editable
    this.role = null; // villager | seer | werewolf
    this.team = null; // villagers | werewolves
    this.color = '#666'; // UI color

    this.state = {
      isAlive: true,
      diedThisTurn: false,
      actions: [],
      bulbOverride: undefined, // {r,g,b} or undefined
    };
  }

  /** --- Role assignment --- */
  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role) throw new Error(`Role ${roleName} does not exist`);

    this.role = role;
    this.team = role.team;
    this.color = role.color ?? TEAMS[role.team]?.color ?? '#999';

    // Initialize actions in state
    this.state.actions = role.defaultActions.map((name) => {
      const baseAction = { ...ACTIONS[name] };
      return {
        ...baseAction,
        active: false,
        selectedTarget: null,
        confirmed: false,
        remainingUsesThisPhase: baseAction.usesPerPhase ?? baseAction.uses ?? 1,
      };
    });
  }

  /** --- Phase management --- */
  initializePhase() {
    this.state.diedThisTurn = false;
    this.state.bulbOverride = undefined;

    this.state.actions.forEach((a) => {
      a.selectedTarget = null;
      a.active = false;
      a.confirmed = false;
      a.remainingUsesThisPhase = a.usesPerPhase ?? a.uses ?? 1;
    });
  }

  /** --- Event / action state updates --- */
  setActionActive(
    actionName,
    active = true,
    resetTarget = true,
    remainingUses
  ) {
    const action = this.state.actions.find((a) => a.name === actionName);
    if (!action) return;

    action.active = active;
    if (resetTarget) action.selectedTarget = null;
    if (remainingUses !== undefined)
      action.remainingUsesThisPhase = remainingUses;
  }

  addAction(actionName, options = {}) {
    const baseAction = ACTIONS[actionName];
    if (!baseAction) return;

    const actionObj = {
      ...baseAction,
      active: options.active ?? false,
      selectedTarget: null,
      confirmed: false,
      remainingUsesThisPhase: baseAction.usesPerPhase ?? baseAction.uses ?? 1,
    };
    this.state.actions.push(actionObj);
  }

  /** --- Available actions based on game state --- */

  getEnabledKeys() {
    const enabled = new Set();

    const activeActions = this.state.actions.filter(
      (a) =>
        a.active &&
        a.remainingUsesThisPhase > 0 &&
        Array.isArray(a.input?.allowed)
    );

    // Add all allowed keys from active actions that are not confirmed
    activeActions.forEach((action) => {
      if (!action.confirmed) {
        action.input.allowed.forEach((key) => enabled.add(String(key)));
      }
    });

    // Add confirm button if any action requires confirmation and has a selected target
    const confirmActive = activeActions.some(
      (a) => a.input.confirmReq && a.selectedTarget != null
    );
    if (confirmActive) enabled.add('confirm');

    return Array.from(enabled); // e.g. ['1','2','A','confirm']
  }

  getAvailableActions() {
    const phase = PHASES.find((p) => p.name === game.getCurrentPhase()?.name);

    return this.state.actions.filter((action) => {
      if (!action.active) return false;
      if (action.remainingUsesThisPhase <= 0) return false;

      const phaseAllowed = phase?.playerActions?.includes(action.name);
      return action.alwaysAvailable || phaseAllowed;
    });
  }

  /** --- Handle raw player input (from Keypad/WS) --- */
  handleInput(key) {
    console.group(`[Player ${this.id}] handleInput: key="${key}"`);
    console.log('Current actions state:');
    this.state.actions.forEach((a) => {
      console.log(
        `- ${a.name}: active=${a.active}, remaining=${a.remainingUsesThisPhase}, confirmed=${a.confirmed}, allowed=${a.input?.allowed}, confirmReq=${a.input?.confirmReq}, selectedTarget=${a.selectedTarget}`
      );
    });

    const action = this.state.actions.find(
      (a) =>
        a.active &&
        a.remainingUsesThisPhase > 0 &&
        Array.isArray(a.input?.allowed) &&
        !a.confirmed &&
        (a.input.allowed.includes(key) ||
          (key === 'confirm' && a.input.confirmReq))
    );

    if (!action) {
      console.warn(`[Player ${this.id}] No action available for key="${key}"`);
      console.groupEnd();
      return { success: false, message: 'No action available for this key' };
    }

    console.log(`[Player ${this.id}] Matched action: ${action.name}`);

    // --- Confirm input
    if (key === 'confirm') {
      if (!action.selectedTarget && !action.input?.allowNone) {
        console.warn(`[Player ${this.id}] Confirm failed: no target selected`);
        console.groupEnd();
        return { success: false, message: 'No target selected' };
      }
      action.confirmed = true;
      console.log(`[Player ${this.id}] Confirmed action: ${action.name}`);
      console.groupEnd();
      return {
        success: true,
        message: `${this.name} confirmed ${action.name}`,
      };
    }

    // --- Validate input
    if (!action.input?.allowed.includes(key)) {
      console.warn(
        `[Player ${this.id}] Invalid input "${key}" for action ${action.name}`
      );
      console.groupEnd();
      return { success: false, message: 'Invalid input for this action' };
    }

    // --- Interrupt actions (A/B or boolean) can just use key as target
    if (action.trigger === 'interrupt') {
      action.selectedTarget = key;
      console.log(
        `[Player ${this.id}] Interrupt action triggered by key "${key}"`
      );
      console.groupEnd();
      return this.performAction(action);
    }

    // --- Regular player selection
    action.selectedTarget = key;
    console.log(
      `[Player ${this.id}] Selected target "${key}" for action ${action.name}`
    );

    // Auto-confirm if confirm not required
    if (!action.input?.confirmReq) {
      console.log(`[Player ${this.id}] Auto-confirming action ${action.name}`);
      console.groupEnd();
      return this.performAction(action);
    }

    console.groupEnd();
    return {
      success: true,
      message: `${this.name} selected ${key} for ${action.name}`,
    };
  }

  /** --- Perform an action and apply its result --- */
  performAction(action, initiatedByHost = false) {
    if (!action || action.remainingUsesThisPhase <= 0) {
      return { success: false, message: 'Action cannot be performed' };
    }

    // Apply the action's result
    if (typeof action.result === 'function') {
      const target = action.selectedTarget;
      // target can be a Player object if you pass it in, or just ID
      action.result(this, action, target);
    }

    // Reduce remaining uses if not host-initiated
    if (!initiatedByHost && action.remainingUsesThisPhase !== Infinity) {
      action.remainingUsesThisPhase -= 1;
    }

    // Deactivate action unless it’s persistent
    if (!action.persistent) action.active = false;

    return {
      success: true,
      message: `${this.name} performed ${action.name}`,
      action,
    };
  }

  /** --- Confirm selection (if needed for actions) --- */
  confirmAction(actionName) {
    const action = this.state.actions.find((a) => a.name === actionName);
    if (!action) return { success: false, message: 'Action not found' };
    if (!action.selectedTarget)
      return { success: false, message: 'No target selected' };

    action.confirmed = true;
    return { success: true, message: `${this.name} confirmed ${actionName}` };
  }

  /** --- Public state for UI --- */
  getPublicState() {
    // Compute enabled keys here because React receives only plain JSON
    const activeActions = this.state.actions.filter(
      (a) =>
        a.active &&
        a.remainingUsesThisPhase > 0 &&
        Array.isArray(a.input?.allowed)
    );

    const enabled = new Set();

    // Allowed keys for any unconfirmed action
    activeActions.forEach((a) => {
      if (!a.confirmed) {
        a.input.allowed.forEach((key) => enabled.add(String(key)));
      }
    });

    // Confirm enabled if an action requires confirmation AND has selected target
    const confirmActive = activeActions.some(
      (a) => a.input.confirmReq && a.selectedTarget != null
    );
    if (confirmActive) enabled.add('confirm');

    return {
      id: this.id,
      name: this.name,
      role: this.role?.name ?? null,
      team: this.team ?? null,
      color: this.color,
      enabledKeys: Array.from(enabled), // <-- SEND IT TO CLIENT
      state: {
        ...this.state,
        actions: this.state.actions.map((a) => ({
          ...a,
          name: a.name,
          active: a.active,
          confirmed: a.confirmed,
          selectedTarget: a.selectedTarget,
          remainingUsesThisPhase: a.remainingUsesThisPhase,
        })),
      },
    };
  }

  /**
   * Flexible setter for Player properties
   * @param {string} key - top-level property or state property
   * @param {any} value - new value
   * @param {boolean} inState - whether to update inside this.state
   */
  set(key, value, inState = false) {
    if (inState) {
      if (!(key in this.state))
        console.warn(`[Player.set] Unknown state key: ${key}`);
      this.state[key] = value;
    } else {
      if (!(key in this)) console.warn(`[Player.set] Unknown property: ${key}`);
      this[key] = value;
    }

    return {
      success: true,
      message: `Player ${this.id} set ${inState ? 'state.' : ''}${key}`,
    };
  }
}

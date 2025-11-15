// Player.js
import { ACTIONS, ROLES, TEAMS, PHASES } from '../../shared/constants.js';

export class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player ${id}`;
    this.role = null;
    this.team = null;
    this.color = '#666';

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

    // Initialize actions
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

    this.state.actions.push({
      ...baseAction,
      active: options.active ?? false,
      selectedTarget: null,
      confirmed: false,
      remainingUsesThisPhase: baseAction.usesPerPhase ?? baseAction.uses ?? 1,
    });
  }

  /** --- Get available actions based on game phase --- */
  getAvailableActions(game) {
    const phase = PHASES.find((p) => p.name === game.getCurrentPhase()?.name);

    return this.state.actions.filter((action) => {
      if (!action.active) return false;
      if (action.remainingUsesThisPhase <= 0) return false;

      const phaseAllowed = phase?.playerActions?.includes(action.name);
      return action.alwaysAvailable || phaseAllowed;
    });
  }

  kill() {
    this.state.isAlive = false;
    this.state.diedThisTurn = true;
  }
  /** --- Get UI state of all keys --- */
  getKeyState() {
    const keys = {};
    const allKeys = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'A',
      'B',
      'confirm',
    ];

    const activeActions = this.state.actions.filter(
      (a) =>
        a.active &&
        a.remainingUsesThisPhase > 0 &&
        Array.isArray(a.input?.allowed)
    );

    // Precompute sets for quick lookup
    const selectedTargets = new Set();
    const enabledKeys = new Set();
    let confirmActive = false;

    activeActions.forEach((a) => {
      if (a.selectedTarget != null) {
        selectedTargets.add(String(a.selectedTarget));
        if (a.input.confirmReq && !a.confirmed) confirmActive = true;
      }
      if (!a.confirmed) {
        a.input.allowed.forEach((k) => enabledKeys.add(String(k)));
      }
    });

    allKeys.forEach((key) => {
      if (key === 'confirm') {
        keys[key] = confirmActive ? 'enabled' : 'disabled';
      } else if (selectedTargets.has(key)) {
        keys[key] = 'selected';
      } else if (enabledKeys.has(key)) {
        keys[key] = 'enabled';
      } else {
        keys[key] = 'disabled';
      }
    });

    return keys;
  }

  /** --- Handle raw input from Keypad/WS --- */
  handleInput(key) {
    console.group(`[Player ${this.id}] handleInput: key="${key}"`);
    console.log('Current actions state:');
    this.state.actions.forEach((a) => {
      console.log(
        `- ${a.name}: active=${a.active}, remaining=${a.remainingUsesThisPhase}, confirmed=${a.confirmed}, allowed=${a.input?.allowed}, confirmReq=${a.input?.confirmReq}, selectedTarget=${a.selectedTarget}`
      );
    });

    const activeActions = this.state.actions.filter(
      (a) =>
        a.active &&
        a.remainingUsesThisPhase > 0 &&
        Array.isArray(a.input?.allowed) &&
        !a.confirmed
    );

    const action = activeActions.find(
      (a) =>
        a.input.allowed.map(String).includes(key) ||
        (key === 'confirm' && a.input.confirmReq)
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

    // --- Interrupt actions (A/B or boolean)
    if (action.trigger === 'interrupt') {
      action.selectedTarget = key;
      console.log(
        `[Player ${this.id}] Interrupt action triggered by key "${key}"`
      );
      console.groupEnd();
      return this.performAction(action);
    }

    // --- Regular selection
    if (action.selectedTarget === key) {
      // Toggle off if already selected
      action.selectedTarget = null;
      console.log(
        `[Player ${this.id}] Cleared selection for action ${action.name}`
      );
      console.groupEnd();
      return {
        success: true,
        message: `${this.name} cleared selection for ${action.name}`,
      };
    }

    // Otherwise select the key
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

  /** --- Perform an action and apply results --- */
  performAction(action, initiatedByHost = false) {
    if (!action || action.remainingUsesThisPhase <= 0) {
      return { success: false, message: 'Action cannot be performed' };
    }

    if (typeof action.result === 'function') {
      action.result(this, action, action.selectedTarget);
    }

    if (!initiatedByHost && action.remainingUsesThisPhase !== Infinity) {
      action.remainingUsesThisPhase -= 1;
    }

    if (!action.persistent) action.active = false;

    return {
      success: true,
      message: `${this.name} performed ${action.name}`,
      action,
    };
  }

  /** --- Confirm an action explicitly --- */
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
    return {
      id: this.id,
      name: this.name,
      role: this.role?.name ?? null,
      team: this.team ?? null,
      color: this.color,
      keyStates: this.getKeyState(),
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

  /** --- Flexible setter --- */
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

// Player.js
import {
  ACTIONS,
  ROLES,
  TEAMS,
  PHASES,
  ALL_KEYS,
  DEBUG_NAMES,
} from '../../shared/constants.js';

export class Player {
  constructor(id) {
    this.id = id;
    this.name = DEBUG_NAMES[id];
    this.role = null;
    this.team = null;
    this.color = '#666';
    this.image = `player${id}.png`;

    this.state = {
      isAlive: true,
      diedThisTurn: false,
      actions: [], // all actions available to this player
      inventory: [], // items granting actions while owned
      keymap: {}, // keys bound to actions/events
    };

    // Initialize keymap with default keys
    this.buildKeymap();
  }

  // -------------------------
  // Initialization / Phase
  // -------------------------

  /** Populate keymap with default keys, all disabled initially */
  buildKeymap() {
    this.state.keymap = {};
    ALL_KEYS.forEach((k) => {
      this.state.keymap[k] = {
        isDisabled: true,
        eventId: null,
        actionName: null,
        isHighlighted: false,
      };
    });
  }

  /** Called at the start of each phase */
  initializePhase() {
    this.state.diedThisTurn = false;

    this.state.actions.forEach((a) => {
      a.selectedTarget = null;
      a.active = false;
      a.confirmed = false;
      a.remainingUsesThisPhase = a.usesPerPhase ?? a.uses ?? 1;
    });

    this.buildKeymap();
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

  // -------------------------
  // Action Management
  // -------------------------

  /** Activate an action by name */
  activateAction(actionName) {
    const action = this.getAction(actionName);
    if (action) action.active = true;
  }

  /** Check if player can use an action */
  canUseAction(actionName) {
    const action = this.getAction(actionName);
    return (
      action?.trigger === 'event' &&
      action.remainingUsesThisPhase > 0 &&
      this.state.isAlive
    );
  }

  /** Get available actions based on current phase */
  getAvailableActions(game) {
    const phase = PHASES.find((p) => p.name === game.getCurrentPhase()?.name);

    return this.state.actions.filter((action) => {
      if (!action.active) return false;
      if (action.remainingUsesThisPhase <= 0) return false;

      const phaseAllowed = phase?.playerActions?.includes(action.name);
      return action.alwaysAvailable || phaseAllowed;
    });
  }

  // -------------------------
  // Keymap & Input
  // -------------------------

  /** Update keymap based on active actions & events */
  updateKeymap(activeEvents = []) {
    // Reset all keys
    Object.keys(this.state.keymap).forEach((k) => {
      this.state.keymap[k] = {
        isDisabled: true,
        eventId: null,
        actionName: null,
        isHighlighted: false,
      };
      this.participatingInEvent = null;

      if (this.state.isAlive) {
        for (const event of activeEvents) {
          if (event.participants.includes(this.id)) {
            this.participatingInEvent = event.eventName;
            break;
          }
        }
      }
    });

    // Skip if player is dead
    if (!this.state.isAlive) return;

    activeEvents.forEach((event) => {
      // Skip events this player isn't participating in
      if (!event.participants.includes(this.id)) return;

      const actionName = event.eventName;
      const eventId = event.id;
      const actionDef = event.eventDef;
      const results = event.results ?? {};
      const completed = event.completedBy.includes(this.id);

      // Only allow alive targets
      const aliveTargets = event.targets.filter((tid) => {
        const player = event.game?.players.find((p) => p.id === tid);
        return !player || player.state?.isAlive !== false; // allow if alive or player info missing
      });

      const allowedKeys = (
        actionDef.input?.allowed ?? aliveTargets.map(String)
      ).filter((k) => aliveTargets.map(String).includes(k));

      if (actionDef.input?.confirmReq) {
        const playerSelection = results[this.id];

        if (!completed) {
          // enable allowed keys, highlight selection if chosen
          allowedKeys.forEach((key) => {
            this.state.keymap[key] = {
              isDisabled: false,
              eventId,
              actionName,
              isHighlighted: key === playerSelection,
            };
          });

          if (playerSelection) {
            this.state.keymap['confirm'] = {
              isDisabled: false,
              eventId,
              actionName,
              isHighlighted: true,
            };
          }
        } else {
          // completed: disable all keys, highlight chosen result
          allowedKeys.forEach((key) => {
            this.state.keymap[key] = {
              isDisabled: true,
              eventId,
              actionName,
              isHighlighted: key === results[this.id],
            };
          });
          this.state.keymap['confirm'] = {
            isDisabled: true,
            eventId,
            actionName,
            isHighlighted: false,
          };
        }
      } else {
        // No confirm required: enable all alive target keys
        allowedKeys.forEach((key) => {
          this.state.keymap[key] = {
            isDisabled: false,
            eventId,
            actionName,
            isHighlighted: false,
          };
        });
      }
    });
  }

  /** Handle raw input from Keypad/WebSocket */
  handleInput(key, event) {
    const keyEntry = this.state.keymap[key];
    if (!keyEntry) {
      return { success: false, message: `[INPUT] Key "${key}" not recognized` };
    }
    if (keyEntry.isDisabled) {
      return { success: false, message: `[INPUT] Key "${key}" is disabled` };
    }

    const { eventId } = keyEntry;

    if (!eventId) {
      return {
        success: false,
        message: `[INPUT] Key "${key}" is not associated with any active event`,
      };
    }

    if (!event) {
      return {
        success: false,
        message: `[INPUT] Event "${eventId}" not found`,
      };
    }

    // Determine type of input
    if (key === 'confirm') {
      // Confirm marks completion for events requiring confirmation
      event.recordResult(this.id, key, true);
      return {
        success: true,
        message: `[INPUT] ${this.name} confirmed completion for ${event.eventName}`,
        event,
      };
    }

    // Otherwise, key is treated as a meaningful response (target selection)
    event.recordResult(this.id, key, false);

    return {
      success: true,
      message: `[INPUT] ${this.name} selected "${key}" for ${event.eventName}`,
      event,
    };
  }

  /** Handle interrupt keys (A/B, boolean) */
  handleInterrupt(key, actionName) {
    const action = this.getAction(actionName);
    if (!action) {
      return {
        success: false,
        message: `Interrupt action "${actionName}" not found`,
      };
    }

    // TODO: implement remainingUses decrement, confirmation, etc.

    return {
      success: true,
      message: `[INPUT] ${this.name} triggered interrupt "${actionName}" with "${key}"`,
      action,
    };
  }

  // -------------------------
  // State Updates
  // -------------------------

  kill() {
    this.state.isAlive = false;
    this.state.diedThisTurn = true;
  }

  rezz() {
    this.state.isAlive = true;
    this.state.diedThisTurn = false;
  }

  /** Flexible setter */
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
      message: `[PLAYER] ${this.name} set ${inState ? 'state.' : ''}${key}`,
    };
  }

  // -------------------------
  // Public getters
  // -------------------------

  getAction(name) {
    return this.state.actions.find((a) => a.name === name) || null;
  }

  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      role: this.role?.name ?? null,
      team: this.team ?? null,
      color: this.color,
      participatingInEvent: this.participatingInEvent,
      keyStates: this.state.keymap,
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
}

import {
  ROLES,
  PHASES,
  PREGAME_HOST_ACTIONS,
  ACTIONS,
  TEAMS,
} from '../../shared/constants.js';

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
    this.actions = []; // all actions from role
    this.availableActions = []; // filtered per phase
    this.selections = {}; // { actionName: targetId }
    this.confirmedSelections = {}; // { actionName: boolean }
    this.actionUsage = {}; // per-phase usage
    this.interruptUsedMap = {};

    // Host controls
    this.hostActions = [];
  }

  /** Assign a role */
  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role) throw new Error(`Role ${roleName} does not exist`);

    this.role = role;
    this.team = role.team;
    this.color = role.color ?? TEAMS[role.team]?.color ?? '#999';

    // Set role actions
    this.actions = [...role.defaultActions];
    console.log(`Player ${this.id} assigned role ${roleName}`, this.actions);
    this.selections = {};
    this.confirmedSelections = {};
    this.actions.forEach((a) => {
      this.selections[a] = null;
      this.confirmedSelections[a] = false;
    });
  }

  /** Update per-phase available actions */
  update({ phaseName, gameStarted, game }) {
    const phase = PHASES.find((p) => p.name === phaseName);

    // Map + filter available actions in one step to keep track of action strings
    this.availableActions = this.actions
      .map((actionName) => {
        const actionDef = ACTIONS[actionName];
        if (!actionDef) {
          console.log(`Missing action for player ${this.id}:`, actionName);
          return null;
        }
        return { name: actionName, def: actionDef };
      })
      .filter((x) => {
        if (!x) return false;
        const { def } = x;
        const cond = def.conditions(this, game);
        const phaseOk = phase?.validActions.includes(def.name);
        const result = def.alwaysAvailable ? cond : phaseOk && cond;

        if (!result) {
          console.log(`Player ${this.id} filtered out action:`, def.name, {
            phaseOk,
            cond,
          });
        }

        return result;
      })
      .map((x) => x.def); // keep only the ACTIONS object

    // Host actions
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

  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      role: this.role?.name ?? null,
      team: this.team ?? null,
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

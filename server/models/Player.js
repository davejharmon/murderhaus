// /server/models/Player.js
import { ROLES, PHASES, ACTIONS, TEAMS } from '../../shared/constants.js';

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
  }

  /** Assign a role */
  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role) throw new Error(`Role ${roleName} does not exist`);

    this.role = role;
    this.team = role.team;
    this.color = role.color ?? TEAMS[role.team]?.color ?? '#999';

    // Initialize actions & selections
    this.actions = [...role.defaultActions];
    this.selections = {};
    this.confirmedSelections = {};
    this.actions.forEach((a) => {
      this.selections[a] = null;
      this.confirmedSelections[a] = false;
    });
  }

  /** Update available actions for the current phase */
  update({ phaseName, gameStarted, game }) {
    const phase = PHASES.find((p) => p.name === phaseName);

    // Find currently active events for this player
    const activeEventNames = game.currentEvents
      .filter((e) => !e.resolved && e.eligible.includes(this.id))
      .map((e) => e.action);

    this.availableActions = this.actions
      .map((actionName) => {
        const def = ACTIONS[actionName];
        if (!def) return null;

        // Always available if flagged, or if currently active event
        const eventActive = activeEventNames.includes(actionName);
        const conditionMet = def.conditions(
          { actor: this, target: null },
          game
        );
        const phaseAllowed = phase?.playerActions?.includes(def.name);
        const available = def.alwaysAvailable
          ? conditionMet
          : (phaseAllowed && conditionMet) || eventActive;

        return available ? def : null;
      })
      .filter(Boolean);
  }

  /** Helper: can perform action this phase */
  canPerform(actionName) {
    return this.availableActions.some((a) => a.name === actionName);
  }

  /** Perform a regular action on a target */
  performAction(actionName, game, targetId) {
    const actionDef = this.availableActions.find((a) => a.name === actionName);
    if (!actionDef) return { success: false, message: 'Action unavailable' };

    const usedCount = this.actionUsage[actionName] || 0;
    if (usedCount >= actionDef.maxPerPhase)
      return { success: false, message: 'Action already used this phase' };

    const target = game.getPlayer(targetId);
    if (!actionDef.conditions(this, game, target))
      return { success: false, message: 'Conditions not met' };

    this.selections[actionName] = targetId;
    this.actionUsage[actionName] = usedCount + 1;

    return {
      success: true,
      message: `Action ${actionName} performed by Player ${this.id}`,
    };
  }

  /** Confirm a previously made selection */
  confirmAction(actionName) {
    const selection = this.selections[actionName];
    if (selection == null)
      return { success: false, message: 'No selection to confirm' };

    this.confirmedSelections[actionName] = selection;
    return {
      success: true,
      message: `Player ${this.id} confirmed ${actionName}`,
    };
  }

  /** Perform an interrupt-type action */
  performInterrupt(actionName, game) {
    const actionDef = this.availableActions.find(
      (a) => a.name === actionName && a.type === 'interrupt'
    );
    if (!actionDef) return { success: false, message: 'Interrupt unavailable' };

    if (this.interruptUsedMap[actionName])
      return { success: false, message: 'Interrupt already used' };

    if (!actionDef.conditions(this, game))
      return { success: false, message: 'Conditions not met for interrupt' };

    this.interruptUsedMap[actionName] = true;
    this.actionUsage[actionName] = (this.actionUsage[actionName] || 0) + 1;

    return {
      success: true,
      message: `Player ${this.id} used interrupt ${actionName}`,
    };
  }

  /** Public state for clients */
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
      selections: this.selections,
      confirmedSelections: this.confirmedSelections,
    };
  }
}

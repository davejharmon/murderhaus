// server/managers/ActionManager.js
export class ActionManager {
  constructor(game) {
    this.game = game;
  }

  performAction(playerId, actionType, targetId) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const actionDef = player.availableActions.find(
      (a) => a.name === actionType
    );
    if (!actionDef) return { success: false, message: 'Action unavailable' };

    const usedCount = player.actionUsage[actionType] || 0;
    if (usedCount >= actionDef.maxPerPhase)
      return { success: false, message: 'Action already used this phase' };

    if (!actionDef.conditions(player, this.game, this.game.getPlayer(targetId)))
      return { success: false, message: 'Conditions not met' };

    player.selections[actionType] = targetId;
    player.actionUsage[actionType] = usedCount + 1;

    return {
      success: true,
      message: `Action ${actionType} performed by Player ${playerId}`,
    };
  }

  confirmAction(playerId, actionType) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };
    const selection = player.selections[actionType];
    if (selection == null)
      return { success: false, message: 'No selection to confirm' };

    player.confirmedSelections[actionType] = selection;
    return {
      success: true,
      message: `Player ${playerId} confirmed ${actionType}`,
    };
  }

  performInterrupt(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const actionDef = player.availableActions.find(
      (a) => a.name === actionName && a.type === 'interrupt'
    );
    if (!actionDef) return { success: false, message: 'Interrupt unavailable' };

    if (player.interruptUsedMap[actionName])
      return { success: false, message: 'Interrupt already used' };

    if (!actionDef.conditions(player, this.game))
      return { success: false, message: 'Conditions not met for interrupt' };

    player.interruptUsedMap[actionName] = true;
    player.actionUsage[actionName] = (player.actionUsage[actionName] || 0) + 1;

    return {
      success: true,
      message: `Player ${playerId} used interrupt ${actionName}`,
    };
  }
}

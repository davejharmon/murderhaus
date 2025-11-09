import { gameManager } from './GameManager.js';
import { sendTo, subscribe, publish } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';

export function handleNewConnection(ws) {
  sendTo(ws, { type: 'WELCOME', payload: { message: 'Connected' } });
}

export function handleWSMessage(ws, data) {
  let msg;
  try {
    msg = JSON.parse(data);
  } catch {
    return sendTo(ws, { type: 'ERROR', payload: { message: 'Invalid JSON' } });
  }

  const { type, payload } = msg;

  switch (type) {
    case 'SUBSCRIBE': {
      const { channel } = payload;
      if (!channel)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing channel' },
        });
      subscribe(ws, channel);
      sendTo(ws, { type: 'SUBSCRIBED', payload: { channel } });
      break;
    }

    case 'REGISTER_PLAYER': {
      const { id } = payload;
      if (id == null)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing player id' },
        });

      const player = gameManager.registerPlayer(id);

      subscribe(ws, `PLAYER_UPDATE:${id}`);
      subscribe(ws, 'GAME_META_UPDATE');
      subscribe(ws, 'PLAYERS_UPDATE');
      subscribe(ws, 'LOG_UPDATE');

      sendTo(ws, { type: `PLAYER_UPDATE:${id}`, payload: player });
      sendTo(ws, { type: 'REGISTERED', payload: { id } });
      break;
    }

    case 'PLAYER_SELECT': {
      const { playerId, actionName, value } = payload;
      const player = gameManager.getPlayer(playerId);
      if (!player)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Player not found' },
        });

      player.handleSelection(value, actionName);
      logger.log(
        `Player ${playerId} selected ${value} for ${actionName}`,
        'action'
      );

      gameManager.broadcastState();
      break;
    }

    case 'PLAYER_CONFIRM': {
      const { playerId, actionName } = payload;
      const player = gameManager.getPlayer(playerId);
      if (!player)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Player not found' },
        });

      player.handleConfirm(actionName);
      logger.log(`Player ${playerId} confirmed ${actionName}`, 'action');

      gameManager.broadcastState();
      break;
    }

    case 'PLAYER_INTERRUPT': {
      const { playerId, actionName = null } = payload;
      const player = gameManager.getPlayer(playerId);

      if (!player || !actionName)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Invalid interrupt' },
        });

      const success = player.handleInterrupt(actionName);
      sendTo(ws, { type: 'INTERRUPT_RESULT', payload: { success } });

      if (success)
        logger.log(
          `Player ${playerId} used interrupt: ${actionName}`,
          'action'
        );

      gameManager.broadcastState();
      break;
    }

    case 'UPDATE_PLAYER_NAME': {
      const { id, name } = payload;
      gameManager.updatePlayerName(id, name);
      break;
    }

    case 'HOST_ACTION': {
      const { playerId, action } = payload;
      gameManager.hostAction(playerId, action);
      break;
    }

    // ✅ START SELECTION EVENT
    case 'START_SELECTION_EVENT': {
      const { actionName } = payload;
      gameManager.startSelectionEvent(actionName);
      break;
    }

    // ✅ REVEAL SELECTION EVENT
    case 'REVEAL_SELECTION_EVENT': {
      const { actionName } = payload;
      gameManager.revealSelectionEvent(actionName);
      break;
    }

    case 'START_GAME':
      gameManager.startGame();
      break;

    case 'NEXT_PHASE':
      gameManager.nextPhase();
      break;

    default:
      logger.log(`Unknown message type: ${type}`, 'error');
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: `Unknown message type: ${type}` },
      });
      break;
  }
}

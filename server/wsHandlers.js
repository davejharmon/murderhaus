import { gameManager } from './GameManager.js';
import { sendTo, broadcast } from './utils/Broadcast.js';
import { logger } from './utils/Logger.js';

export function handleNewConnection(ws) {
  sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameManager.getState() });
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
      if (actionName == null)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'No action keyed to interrupt' },
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
      const player = gameManager.getPlayer(id);
      if (!player) {
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Player not found' },
        });
      }

      player.name = name;
      logger.log(`Player ${id} changed name to ${name}`, 'action');

      // Broadcast the updated state to everyone
      gameManager.broadcastState();
      break;
    }

    case 'HOST_ACTION': {
      const { playerId, action } = payload;
      gameManager.hostAction(playerId, action);
      break;
    }

    case 'START_GAME':
      gameManager.startGame();
      break;

    case 'NEXT_PHASE':
      gameManager.nextPhase();
      break;

    case 'REGISTER_PLAYER': {
      const { id } = payload;
      if (id == null) {
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing player id' },
        });
      }

      const player = gameManager.registerPlayer(id);

      // Send updated state to all clients
      gameManager.broadcastState();
      break;
    }

    default:
      logger.log(
        `Received unknown message type: ${type} with payload: ${JSON.stringify(
          payload
        )}`,
        'error'
      );
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: `Unknown message type: ${type}` },
      });
      break;
  }
}

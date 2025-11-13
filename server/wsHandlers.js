import { gameManager } from './GameManager.js';
import { sendTo, subscribe } from './utils/Broadcast.js';
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
      gameManager.playerAction(playerId, actionName, value);
      break;
    }

    case 'PLAYER_CONFIRM': {
      const { playerId, actionName } = payload;
      gameManager.playerConfirm(playerId, actionName);
      break;
    }

    case 'PLAYER_INTERRUPT': {
      const { playerId, actionName } = payload;
      gameManager.playerInterrupt(playerId, actionName);
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

    // --- Refactored event messages ---
    case 'START_EVENT': {
      const { actionName, initiatedBy } = payload;
      gameManager.startEvent(actionName, initiatedBy || 'host');
      break;
    }

    case 'RESOLVE_EVENT': {
      const { actionName } = payload;
      gameManager.resolveEvent(actionName);
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

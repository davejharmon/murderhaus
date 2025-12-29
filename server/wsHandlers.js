// /server/wsHandlers.js
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
    // -------------------------
    // Subscriptions
    // -------------------------
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

    // -------------------------
    // Player Management
    // -------------------------
    case 'QUERY_PLAYER_EXISTS': {
      const { playerId } = payload;
      const player = gameManager.getPlayer(playerId);

      sendTo(ws, {
        type: 'PLAYER_EXISTS',
        payload: { playerId, exists: !!player },
      });

      if (player) {
        subscribe(ws, `PLAYER_UPDATE:${playerId}`);
        subscribe(ws, 'GAME_META_UPDATE');

        sendTo(ws, {
          type: `PLAYER_UPDATE:${playerId}`,
          payload: player.getPublicState(),
        });
        sendTo(ws, {
          type: 'GAME_META_UPDATE',
          payload: gameManager.game.getPublicState(),
        });
      }
      break;
    }

    case 'REGISTER_PLAYER': {
      const { playerId } = payload;
      if (!playerId)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing playerId' },
        });

      const player = gameManager.registerPlayer(playerId);

      subscribe(ws, `PLAYER_UPDATE:${playerId}`);
      subscribe(ws, 'GAME_META_UPDATE');
      subscribe(ws, 'PLAYERS_UPDATE');
      subscribe(ws, 'LOG_UPDATE');

      sendTo(ws, {
        type: `PLAYER_UPDATE:${playerId}`,
        payload: player.getPublicState(),
      });
      sendTo(ws, { type: 'REGISTERED', payload: { playerId } });
      break;
    }

    // -------------------------
    // Player Input
    // -------------------------
    case 'PLAYER_INPUT': {
      const { playerId, key } = payload;
      gameManager.playerInput(playerId, key);
      break;
    }

    // -------------------------
    // Host Controls
    // -------------------------
    case 'HOST_UPDATE_PLAYER_NAME': {
      const { playerId, name } = payload;
      gameManager.updatePlayerName(playerId, name);
      break;
    }

    case 'HOST_UPDATE_PLAYER_IMAGE': {
      const { playerId, image } = payload;
      gameManager.updatePlayerImage(playerId, image);
      break;
    }

    case 'HOST_ACTION': {
      const { playerId, actionName } = payload;
      gameManager.hostAction(playerId, actionName);
      break;
    }

    case 'START_EVENT': {
      const { eventName } = payload;
      gameManager.startEvent(eventName);
      break;
    }

    case 'RESOLVE_EVENT': {
      const { eventId } = payload;
      if (!eventId)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing eventId' },
        });
      gameManager.resolveEvent(eventId);
      break;
    }

    // -------------------------
    // Game Lifecycle
    // -------------------------
    case 'START_GAME':
      gameManager.startGame();
      break;

    case 'NEXT_PHASE':
      gameManager.nextPhase();
      break;

    // -------------------------
    // Slides (optional)
    // -------------------------
    case 'SLIDE_NEXT':
      gameManager.slideManager?.next();
      break;

    case 'SLIDE_PREV':
      gameManager.slideManager?.prev();
      break;

    case 'SLIDES_CLEAR':
      gameManager.slideManager?.clear();
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

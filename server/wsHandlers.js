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

    case 'QUERY_PLAYER_EXISTS': {
      const { id } = payload;
      const player = gameManager.getPlayer(id);

      // Inform client whether the player exists
      sendTo(ws, {
        type: 'PLAYER_EXISTS',
        payload: { id, exists: !!player },
      });

      if (player) {
        // Subscribe the client to updates
        subscribe(ws, `PLAYER_UPDATE:${id}`);
        subscribe(ws, 'GAME_META_UPDATE');

        // Immediately push current state so this client is up-to-date
        sendTo(ws, {
          type: `PLAYER_UPDATE:${id}`,
          payload: player.getPublicState(),
        });
        sendTo(ws, {
          type: 'GAME_META_UPDATE',
          payload: gameManager.game.getPublicState(), // or whatever your meta payload is
        });
      }

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

    case 'PLAYER_INPUT': {
      const { actorId, key } = payload;
      gameManager.playerInput(actorId, key);
      break;
    }

    case 'HOST_UPDATE_PLAYER_NAME': {
      const { id, name } = payload;
      gameManager.updatePlayerName(id, name);
      break;
    }

    case 'HOST_UPDATE_PLAYER_IMAGE': {
      const { id, image } = payload;
      gameManager.updatePlayerImage(id, image);
      break;
    }

    case 'HOST_ACTION': {
      const { playerId, actionName } = payload;
      gameManager.hostAction(playerId, actionName);
      break;
    }

    case 'START_EVENT': {
      const { eventName, initiatedBy } = payload;
      // Still using actionName because the event hasn’t been created yet
      gameManager.startEvent(eventName, initiatedBy || 'host');
      break;
    }

    case 'RESOLVE_EVENT': {
      const { eventId } = payload;
      console.log('[WS] Resolving', eventId);
      if (!eventId)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing eventId' },
        });

      gameManager.resolveEvent(eventId);
      break;
    }

    case 'START_ALL_EVENTS': {
      console.log('[WS] Starting all pending events');
      gameManager.startAllEvents();
      break;
    }

    case 'RESOLVE_ALL_EVENTS': {
      console.log('[WS] Resolving all active events');
      gameManager.resolveAllEvents();
      break;
    }

    case 'CLEAR_EVENT': {
      const { eventId } = payload;
      if (!eventId)
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing eventId' },
        });

      gameManager.clearEvent(eventId);
      break;
    }

    case 'START_GAME':
      gameManager.startGame();
      break;

    case 'NEXT_PHASE':
      gameManager.nextPhase();
      break;

    // SLIDE MANAGEMENT

    case 'SLIDE_NEXT':
      gameManager.slideManager.next();
      break;

    case 'SLIDE_PREV':
      gameManager.slideManager.prev();
      break;

    case 'SLIDES_CLEAR':
      gameManager.slideManager.clear();
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

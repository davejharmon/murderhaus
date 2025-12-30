// /server/wsHandlers.js
import { CHANNELS } from '../shared/constants/index.js';
import { gameManager } from './GameManager.js';
import { sendTo, subscribe, publish } from './utils/Broadcast.js';
import { logger as Log } from './utils/Logger.js';

export function handleNewConnection(ws) {
  // Transport-level handshake only
  sendTo(ws, { type: 'WELCOME', payload: { message: 'Connected' } });
}

export function handleWSMessage(ws, msg) {
  const { type, payload } = msg;

  if (!type) {
    return sendTo(ws, {
      type: 'ERROR',
      payload: { message: 'Missing message type' },
    });
  }

  switch (type) {
    // -------------------------
    // Subscriptions
    // -------------------------
    case 'SUBSCRIBE': {
      const { channel } = payload;
      if (!channel) {
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing channel' },
        });
      }

      subscribe(ws, channel);
      sendTo(ws, { type: 'SUBSCRIBED', payload: { channel } });
      break;
    }

    // -------------------------
    // Player Management
    // -------------------------
    case 'QUERY_PLAYER_EXISTS': {
      try {
        const { playerId } = payload;
        const player = gameManager.getPlayer(playerId);

        sendTo(ws, {
          type: 'PLAYER_EXISTS',
          payload: { playerId, exists: !!player },
        });

        if (player) {
          subscribe(ws, CHANNELS.playerUpdate(playerId));
          subscribe(ws, CHANNELS.GAME_UPDATE);

          publish(CHANNELS.playerUpdate(playerId), player.getPublicState());
          publish(CHANNELS.GAME_UPDATE, gameManager.game.getPublicState());
        }
      } catch (err) {
        Log.error('QUERY_PLAYER_EXISTS failed', { error: err });
      }
      break;
    }

    case 'REGISTER_PLAYER': {
      const { playerId } = payload;

      const player = gameManager.registerPlayer(playerId);

      subscribe(ws, CHANNELS.playerUpdate(playerId));
      subscribe(ws, CHANNELS.GAME_UPDATE);

      publish(CHANNELS.playerUpdate(playerId), player.getPublicState());
      publish(CHANNELS.GAME_UPDATE, gameManager.game.getPublicState());
      publish(CHANNELS.LOG_UPDATE, Log.getEntries());

      sendTo(ws, {
        type: 'REGISTERED',
        payload: { playerId },
      });
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
      if (!eventId) {
        return sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Missing eventId' },
        });
      }
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
    // Slides
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
      Log.error(`Unknown message type: ${type}`);
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: `Unknown message type: ${type}` },
      });
      break;
  }
}

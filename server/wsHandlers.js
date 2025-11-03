// server/wsHandlers.js
import { gameManager } from './GameManager.js';
import { sendTo } from './utils/Broadcast.js';

// Send initial game state to a new connection
export function handleNewConnection(ws) {
  sendTo(ws, {
    type: 'GAME_STATE_UPDATE',
    payload: gameManager.getState(),
  });
}

// Handle incoming messages from clients
export function handleWSMessage(ws, data) {
  let msg;
  try {
    msg = JSON.parse(data);
  } catch {
    return sendTo(ws, {
      type: 'ERROR',
      payload: { message: 'Invalid JSON' },
    });
  }

  const { type, payload } = msg;

  switch (type) {
    case 'REGISTER_PLAYER':
      gameManager.registerPlayer(ws, payload);
      break;

    case 'UPDATE_PLAYER_NAME':
      gameManager.updatePlayerName(payload);
      break;

    case 'START_GAME':
      gameManager.startGame();
      break;

    case 'SET_PHASE':
      gameManager.setPhase(payload?.phase);
      break;

    case 'ASSIGN_ROLE': {
      const { playerId, role } = payload;
      gameManager.setPlayerRole(playerId, role);
      break;
    }

    case 'KILL_PLAYER': {
      const { playerId } = payload;
      gameManager.killPlayer(playerId);
      break;
    }

    case 'REVIVE_PLAYER': {
      const { playerId } = payload;
      gameManager.revivePlayer(playerId);
      break;
    }

    // Generic player action handler
    case 'PLAYER_ACTION': {
      const { playerId, action, target } = payload;
      // Generic pattern: GameState handles the rules
      gameManager.doAction(playerId, action, target);
      break;
    }

    case 'PLAYER_CONFIRM_ACTION': {
      const { playerId, action } = payload;
      gameManager.confirmAction(playerId, action);
      break;
    }

    case 'END_GAME':
      gameManager.endGame();
      break;

    default:
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Unknown message type' },
      });
  }
}

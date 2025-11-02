import { gameManager } from './GameManager.js';
import { sendTo } from './utils/broadcast.js';

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
      gameManager.setPlayerRole(playerId, role); // ✅ use GameManager method
      break;
    }
    case 'KILL_PLAYER': {
      const { playerId } = payload;
      gameManager.killPlayer(playerId); // ✅ use GameManager method
      break;
    }
    case 'REVIVE_PLAYER': {
      const { playerId } = payload;
      gameManager.revivePlayer(playerId);
      break;
    }

    case 'END_GAME':
      gameManager.endGame();
      break;
    default:
      sendTo(ws, { type: 'ERROR', payload: { message: 'Unknown type' } });
  }
}

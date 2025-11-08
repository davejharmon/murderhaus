import { gameManager } from './GameManager.js';
import { sendTo } from './utils/Broadcast.js';

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
  const _callGM = (fn) => {
    try {
      fn();
      return true;
    } catch (err) {
      sendTo(ws, { type: 'ERROR', payload: { message: err.message } });
      return false;
    }
  };

  switch (type) {
    case 'REGISTER_PLAYER':
      gameManager.addPlayer(ws, payload.id);
      break;
    case 'UPDATE_PLAYER_NAME':
      _callGM(() => gameManager.updatePlayerName(payload));
      break;
    case 'START_GAME':
      _callGM(() => gameManager.startGame());
      break;
    case 'SET_PHASE':
      _callGM(() => gameManager.setPhase(payload.phase));
      break;
    case 'ASSIGN_ROLE':
      _callGM(() => gameManager.setPlayerRole(payload.playerId, payload.role));
      break;
    case 'KILL_PLAYER':
      _callGM(() => gameManager.killPlayer(payload.playerId));
      break;
    case 'REVIVE_PLAYER':
      _callGM(() => gameManager.revivePlayer(payload.playerId));
      break;
    case 'START_EVENT':
      _callGM(() => gameManager.startEvent(payload.eventType, payload.targets));
      break;
    case 'REVEAL_EVENT':
      _callGM(() => gameManager.revealEvent(payload.eventType));
      break;
    case 'PLAYER_ACTION':
      _callGM(() =>
        gameManager.doAction(payload.playerId, payload.action, payload.target)
      );
      break;
    case 'PLAYER_CONFIRM_ACTION':
      _callGM(() =>
        gameManager.confirmAction(payload.playerId, payload.action)
      );
      break;
    case 'END_GAME':
      _callGM(() => gameManager.endGame());
      break;
    default:
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Unknown message type' },
      });
  }
}

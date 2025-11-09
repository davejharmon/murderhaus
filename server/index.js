import { getWSS, sendTo, subscribe } from './utils/Broadcast.js';
import { gameManager } from './GameManager.js';
import { handleWSMessage } from './wsHandlers.js';
import { logger } from './utils/Logger.js';

const wss = getWSS(8080);

wss.on('connection', (ws) => {
  logger.log('Client connected', 'system');

  // Auto-subscribe this client to channels Host cares about
  ['PLAYERS_UPDATE', 'LOG_UPDATE', 'GAME_META_UPDATE'].forEach((ch) =>
    subscribe(ws, ch)
  );

  // Send current game state immediately (optional, useful for Host refresh)
  const state = gameManager.getState(); // <-- Use getState() instead of state
  sendTo(ws, { type: 'PLAYERS_UPDATE', payload: state.players });
  sendTo(ws, { type: 'LOG_UPDATE', payload: state.log });
  sendTo(ws, {
    type: 'GAME_META_UPDATE',
    payload: {
      phase: state.phase,
      gameStarted: state.gameStarted,
      dayCount: state.dayCount,
    },
  });

  // Listen for messages from this client
  ws.on('message', (msg) => {
    try {
      handleWSMessage(ws, msg);
    } catch (err) {
      logger.log(`⚠️: ${err.message}`, 'error');
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Internal server error' },
      });
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    logger.log('Client disconnected', 'system');
  });
});

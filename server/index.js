import { getWSS, sendTo } from './utils/Broadcast.js';
import { gameManager } from './GameManager.js';
import { handleWSMessage } from './wsHandlers.js';
import { logger } from './utils/Logger.js';

const wss = getWSS(8080);

wss.on('connection', (ws) => {
  logger.log('Client connected', 'system');

  // Send current game state immediately
  sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameManager.getState() });

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

export { wss };

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

  // Send current slices immediately (replace getState())
  gameManager.publishPlayersSlice();
  gameManager.publishGameMeta();
  gameManager.publishLog();

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

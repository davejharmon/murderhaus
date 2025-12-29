import { getWSS, sendTo, subscribeAllMain } from './utils/Broadcast.js';
import { gameManager } from './GameManager.js';
import { handleWSMessage } from './wsHandlers.js';
import { logger } from './utils/Logger.js';

const wss = getWSS(8080);

process.on('uncaughtException', (err) => {
  console.error('[FATAL ERROR]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

wss.on('connection', (ws) => {
  logger.log('Client connected', 'system');

  // Auto-subscribe this client to all main channels
  subscribeAllMain(ws);

  // Send current slices immediately if view exists
  if (gameManager.view) {
    gameManager.view.publishAllPlayers();
    gameManager.view.publishGameMeta();
    gameManager.view.publishLog();
  }

  // Listen for messages from this client
  ws.on('message', (msg) => {
    try {
      const str = msg.toString(); // <-- ensures it's a string
      const data = JSON.parse(str); // <-- parse JSON
      handleWSMessage(ws, data);
    } catch (err) {
      logger.log(`⚠️ Error handling WS message: ${err.message}`, 'error');
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Invalid message format or internal server error' },
      });
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    logger.log('Client disconnected', 'system');
  });
});

// Optional: graceful shutdown
process.on('SIGINT', () => {
  logger.log('Shutting down server...', 'system');
  wss.close(() => process.exit(0));
});

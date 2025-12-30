import { getWSS, sendTo, subscribeAllMain } from './utils/Broadcast.js';
import { gameManager } from './GameManager.js';
import { handleWSMessage } from './wsHandlers.js';
import { logger as Log } from './utils/Logger.js';

/* ================= EXIT DIAGNOSTICS ================= */

function logExit(reason, extra) {
  const stamp = new Date().toISOString();
  console.error('\n========== SERVER EXIT ==========');
  console.error('Time:', stamp);
  console.error('Reason:', reason);
  if (extra) console.error('Details:', extra);
  console.error('Stack:\n', new Error().stack);
  console.error('================================\n');
}

process.on('exit', (code) => {
  logExit(`process exit event (${code})`);
});

process.on('beforeExit', (code) => {
  logExit(`beforeExit(${code})`);
});

process.on('uncaughtException', (err) => {
  logExit('uncaughtException', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logExit('unhandledRejection', reason);
  process.exit(1);
});

/* ===== Production-only shutdown handling ===== */

if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', () => {
    logExit('SIGINT (production)');
    if (wss) {
      wss.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });

  process.on('SIGTERM', () => {
    logExit('SIGTERM (production)');
    process.exit(0);
  });
}

/* ================= SERVER BOOT ================= */

let wss;
try {
  wss = getWSS(8080);
} catch (err) {
  console.error('[WSS INIT FAILED]', err);
  process.exit(1);
}

wss.on('error', (err) => {
  console.error('[WSS ERROR]', err);
});

/* ================= CONNECTION HANDLING ================= */

wss.on('connection', (ws) => {
  Log.log('Client connected', 'debug');

  subscribeAllMain(ws);

  if (gameManager.view) {
    try {
      gameManager.view.publishAllPlayers();
      gameManager.view.publishGameMeta();
      gameManager.view.publishLog();
    } catch (err) {
      Log.log(`⚠️ View publish failed: ${err.message}`, 'error');
    }
  }

  ws.on('message', (msg) => {
    try {
      const str = msg.toString();
      if (!str || str[0] !== '{') return;
      handleWSMessage(ws, JSON.parse(str));
    } catch (err) {
      Log.log(`⚠️ WS message error: ${err.message}`, 'error');
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Invalid message format' },
      });
    }
  });

  ws.on('close', () => {
    Log.log('Client disconnected', 'debug');
  });
});

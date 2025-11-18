// src/ws.js

let socket = null;
let messageQueue = [];
let listeners = {}; // keyed by type
let statusListeners = [];
let isConnecting = false;
const reconnectInterval = 2000;

const WS_URL = import.meta.env.DEV
  ? `ws://${location.hostname}:8080`
  : `${window.location.origin.replace(/^http/, 'ws')}`;

function notifyStatus(status) {
  statusListeners.forEach((fn) => fn(status));
  console.log('[WS STATUS]', status);
}

function initSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    notifyStatus(
      socket.readyState === WebSocket.OPEN ? 'connected' : 'connecting'
    );
    return;
  }

  isConnecting = true;
  notifyStatus('connecting');

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    isConnecting = false;
    notifyStatus('connected');
    console.log('[WS] Connected');

    while (messageQueue.length) {
      const { type, payload } = messageQueue.shift();
      socket.send(JSON.stringify({ type, payload }));
    }
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      console.error('[WS] Failed to parse message:', event.data, err);
      return;
    }

    const { type, payload } = msg;

    const typeListeners = listeners[type] || [];
    typeListeners.forEach((fn) => fn(payload));
  };

  socket.onclose = () => {
    console.warn('[WS] Disconnected');
    notifyStatus('disconnected');
    socket = null;
    isConnecting = false;
    setTimeout(initSocket, reconnectInterval);
  };

  socket.onerror = (err) => {
    console.error('[WS] Error:', err);
    if (socket) socket.close();
  };
}

initSocket();

export function ensureConnected() {
  return new Promise((resolve) => {
    if (socket && socket.readyState === WebSocket.OPEN) resolve();
    else {
      const unsub = subscribeStatus((status) => {
        if (status === 'connected') {
          resolve();
          unsub();
        }
      });
      if (!socket && !isConnecting) initSocket();
    }
  });
}

export function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    messageQueue.push({ type, payload });
    if (!isConnecting) initSocket();
  }
}

/**
 * Subscribe to a specific message type
 * @param {string} type
 * @param {function} fn
 */
export function subscribe(type, fn) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(fn);

  return () => {
    listeners[type] = listeners[type].filter((l) => l !== fn);
  };
}

export function subscribeServerChannel(channel) {
  send('SUBSCRIBE', { channel }); // send a WS message to server
}

export function subscribeStatus(fn) {
  statusListeners.push(fn);

  let currentStatus = 'disconnected';
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) currentStatus = 'connected';
    else if (socket.readyState === WebSocket.CONNECTING)
      currentStatus = 'connecting';
  } else if (isConnecting) currentStatus = 'connecting';
  fn(currentStatus);

  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

export function getSocketReadyState() {
  return socket ? socket.readyState : WebSocket.CLOSED;
}

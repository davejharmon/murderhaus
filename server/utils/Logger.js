import { CHANNELS } from '../../shared/constants/index.js';
import { publish } from './Broadcast.js';

// server/utils/logger.js
class Logger {
  constructor(maxEntries = 1000) {
    this.entries = [];
    this.maxEntries = maxEntries;
  }

  /**
   * Generic log method
   * @param {string} message - Message to log
   * @param {string} type - info | warn | error | system
   * @param {object} options - Additional options
   *   options.context - string or object
   *   options.player - player object to auto-include info
   *   options.error - Error object
   */
  log(
    message,
    type = 'system',
    { context = null, player = null, error = null } = {}
  ) {
    const timestamp = new Date().toISOString();

    // Auto-build context from player if provided
    let contextStr = '';
    if (player) {
      const parts = [`id:${player.id}`];
      if (player.role) parts.push(`role:${player.role}`);
      if (player.team) parts.push(`team:${player.team}`);
      contextStr = parts.join(', ');
      if (context)
        contextStr += ` | ${
          typeof context === 'string' ? context : JSON.stringify(context)
        }`;
    } else if (context) {
      contextStr =
        typeof context === 'string' ? context : JSON.stringify(context);
    }

    const entry = {
      timestamp,
      type,
      message,
      context: contextStr || null,
      stack: error?.stack ?? null,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();

    // Console output
    const stackStr = error?.stack ? `\n${error.stack}` : '';
    console.log(
      `[${type.toUpperCase()}] ${timestamp}: ${message}${
        contextStr ? ' | ' + contextStr : ''
      }${stackStr}`
    );
  }

  // Helper shortcuts
  info(msg, opts = {}) {
    this.log(msg, 'info', opts);
  }
  warn(msg, opts = {}) {
    this.log(msg, 'warn', opts);
  }
  error(msg, opts = {}) {
    this.log(msg, 'error', opts);
  }
  system(msg, opts = {}) {
    this.log(msg, 'system', opts);
  }

  getEntries(type) {
    return type ? this.entries.filter((e) => e.type === type) : this.entries;
  }

  clear() {
    this.entries = [];
  }

  toHistoryObjects() {
    return this.entries.map((e) => ({ ...e }));
  }
}

export const logger = new Logger();

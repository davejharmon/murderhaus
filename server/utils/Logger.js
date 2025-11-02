// server/utils/logger.js
class Logger {
  constructor() {
    this.entries = [];
  }

  log(message, type = 'system') {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    this.entries.push(entry);
    console.log(
      `[${entry.type.toUpperCase()}] ${entry.timestamp}: ${entry.message}`
    );
  }

  getEntries(type) {
    return type ? this.entries.filter((e) => e.type === type) : this.entries;
  }

  clear() {
    this.entries = [];
  }

  toHistoryStrings() {
    return this.entries.map((e) => `[${e.type}] ${e.message}`);
  }
}

// Export a singleton instance
export const logger = new Logger();

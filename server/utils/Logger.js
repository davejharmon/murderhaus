// server/utils/logger.js
class Logger {
  constructor(maxEntries = 1000) {
    this.entries = [];
    this.maxEntries = maxEntries;
  }

  log(message, type = 'system') {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };

    this.entries.push(entry);

    // Trim entries if exceeding max
    if (this.entries.length > this.maxEntries) this.entries.shift();

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

  // Returns objects, not strings — rename for clarity
  toHistoryObjects() {
    return this.entries.map((e) => ({ ...e }));
  }
}

export const logger = new Logger();

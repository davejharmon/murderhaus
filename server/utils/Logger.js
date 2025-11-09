// server/utils/logger.js
class Logger {
  constructor(maxEntries = 1000) {
    this.entries = [];
    this.maxEntries = maxEntries;
  }

  log(message, type = 'system', context = null, errorObj = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      context,
      stack: errorObj?.stack || null,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();

    let output = `[${type.toUpperCase()}] ${entry.timestamp}: ${message}`;
    if (context) output += ` | context: ${context}`;
    if (errorObj) output += `\n${errorObj.stack}`;

    console.log(output);
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

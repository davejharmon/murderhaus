// server/utils/logger.js
class Logger {
  constructor() {
    this.entries = [];
  }

  /**
   * Log a message
   * @param {string} message - The message to log
   * @param {string} type - The type/category of message (system, vote, murder, etc.)
   */
  log(message, type = 'system') {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    this.entries.push(entry);

    // Also log to server console
    console.log(
      `[${entry.type.toUpperCase()}] ${entry.timestamp}: ${entry.message}`
    );
  }

  /**
   * Get entries
   * @param {string} type - optional, filter by type
   * @returns {Array<{timestamp:string,type:string,message:string}>}
   */
  getEntries(type) {
    return type ? this.entries.filter((e) => e.type === type) : this.entries;
  }

  /**
   * Non-destructively clear history
   */
  clear() {
    this.entries = [];
  }

  /**
   * Convert entries to simple strings (fallback)
   */
  toHistoryStrings() {
    // returns array of { timestamp, type, message } objects now
    return this.entries.map((e) => ({
      timestamp: e.timestamp,
      type: e.type,
      message: e.message,
    }));
  }
}

// Export a singleton instance
export const logger = new Logger();

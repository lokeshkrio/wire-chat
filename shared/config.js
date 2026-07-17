/**
 * Global Configuration for WireChat
 * Centralized settings for network, database, validation rules, and client/server defaults.
 */
export const config = {
  // Network connection settings
  network: {
    host: "127.0.0.1",
    port: 5051,
    protocol: "ws",
  },

  // SQLite database configuration
  database: {
    // Filename in the project root directory
    filename: "chat.db",
  },

  // Application defaults
  defaults: {
    defaultRoom: "general",
    historyLimit: 50,
  },

  // Constraints used for packet validation
  validation: {
    username: {
      minLength: 2,
      maxLength: 20,
    },
    message: {
      maxLength: 500,
    }
  }
};

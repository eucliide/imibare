/**
 * Structured logging utility.
 * Outputs JSON in production for log aggregation, pretty-prints in development.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDev = process.env.NODE_ENV === "development";

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

function output(entry: LogEntry): void {
  if (isDev) {
    // Pretty print in development
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    console.log(prefix, entry.message);
    if (entry.context) {
      console.log("Context:", entry.context);
    }
    if (entry.error) {
      console.error("Error:", entry.error);
    }
  } else {
    // JSON output in production for log aggregation
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    const entry = createLogEntry("info", message, context);
    output(entry);
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = createLogEntry("warn", message, context);
    output(entry);
  },

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry = createLogEntry("error", message, context, error);
    output(entry);
  },
};

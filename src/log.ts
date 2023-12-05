import type { Context } from './types'

/** Logging context. */
export type Logger = ReturnType<typeof createLogger>

/** Log level (or severity). */
export type LogLevel = keyof typeof LogLevels

/** Log levels and their corresponding numeric severity. */
const LogLevels = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
}

/** Log level translation map for display. */
const LogLevelStrings: Record<LogLevel, string> = {
  trace: 'TRC',
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
}

/** Create a logging context. */
function createLogger({ config }: Context) {
  // If an invalid log level is provided, default to info level
  const minLevel = LogLevels[config.log.level as LogLevel] || LogLevels.info

  /**
   * Write a log message at a specific level of severity.
   */
  function write(level: LogLevel, ...a: unknown[]) {
    const time = new Date().toLocaleTimeString()
    if (level === 'trace') {
      // Don't print TRC as console.trace prefixes "Trace: " and prints stack
      console.trace(time, ...a)
    } else {
      console[level](time, LogLevelStrings[level], ...a)
    }
  }

  /** Write a trace message. */
  function trace(...a: unknown[]) {
    if (minLevel <= LogLevels.trace) write('trace', ...a)
  }

  /** Write a debug message. */
  function debug(...a: unknown[]) {
    if (minLevel <= LogLevels.debug) write('debug', ...a)
  }

  /** Write an informational message. */
  function info(...a: unknown[]) {
    if (minLevel <= LogLevels.info) write('info', ...a)
  }

  /** Write a warning message. */
  function warn(...a: unknown[]) {
    if (minLevel <= LogLevels.warn) write('warn', ...a)
  }

  /** Write an error message. */
  function error(...a: unknown[]) {
    if (minLevel <= LogLevels.error) write('error', ...a)
  }

  return { trace, debug, info, warn, error }
}

export default createLogger

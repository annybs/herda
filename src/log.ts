import type { Context } from './types'

export type Logger = ReturnType<typeof createLogger>

export type LogLevel = keyof typeof LogLevels

const LogLevels = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
}

const LogLevelStrings: Record<LogLevel, string> = {
  trace: 'TRC',
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
}

function createLogger({ config }: Context) {
  // If an invalid log level is provided, default to info level
  const minLevel = LogLevels[config.log.level as LogLevel] || LogLevels.info

  function write(level: LogLevel, ...a: unknown[]) {
    const time = new Date().toLocaleTimeString()
    if (level === 'trace') {
      // Don't print TRC as console.trace prefixes "Trace: " and prints stack
      console.trace(time, ...a)
    } else {
      console[level](time, LogLevelStrings[level], ...a)
    }
  }

  function trace(...a: unknown[]) {
    if (minLevel <= LogLevels.trace) write('trace', ...a)
  }

  function debug(...a: unknown[]) {
    if (minLevel <= LogLevels.debug) write('debug', ...a)
  }

  function info(...a: unknown[]) {
    if (minLevel <= LogLevels.info) write('info', ...a)
  }

  function warn(...a: unknown[]) {
    if (minLevel <= LogLevels.warn) write('warn', ...a)
  }

  function error(...a: unknown[]) {
    if (minLevel <= LogLevels.error) write('error', ...a)
  }

  return { trace, debug, info, warn, error }
}

export default createLogger

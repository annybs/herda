import type { Logger } from './log'

export interface Config {
  api: {
    prefix: string
  }
  http: {
    host: string
    port: number
  }
  log: {
    level: string
  }
}

export interface Context {
  config: Config
  log: Logger
}

import type { Auth } from './auth'
import type { Logger } from './log'
import type { Models } from './db'
import type { Db, MongoClient } from 'mongodb'

export interface Config {
  api: {
    prefix: string
  }
  auth: {
    jwt: {
      expiresIn: number
      secret: string
    }
  }
  http: {
    host: string
    port: number
  }
  log: {
    level: string
  }
  mongo: {
    db: string
    uri: string
  }
  shutdownTimeout: number
}

export interface Context {
  auth: Auth
  config: Config
  db: Db
  log: Logger
  model: Models
  mongo: MongoClient
}

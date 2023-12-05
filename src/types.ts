export interface Config {
  api: {
    prefix: string
  }
  http: {
    host: string
    port: number
  }
}

export interface Context {
  config: Config
}

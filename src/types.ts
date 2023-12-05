export interface Config {
  http: {
    host: string
    port: number
  }
}

export interface Context {
  config: Config
}

import type { Options } from './lib'
import { request } from './lib'

/** Herda Server information. */
export interface ServerInfo {
  /** Server name. */
  product: string
  /** Server version. */
  version: string
}

/**
 * Get information about Herda Server.
 * The API is static, so this function can be used to check whether the server is reachable.
 */
export function getServerInfo(opt: Options): Promise<ServerInfo> {
  return request(opt, 'GET', '/')
}

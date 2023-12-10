export * from './account'
export * from './herd'
export * from './misc'
export * from './task'

/** Document with an unique ID. */
export type WithId<T> = T & {
  /** Document ID. */
  _id: string
}

/** HTTP request method. */
export type Method = 'DELETE' | 'GET' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT'

/** Request options. */
export interface Options {
  /** HTTP base URL for Herda Server API. */
  host: string
  /** Bearer token for authentication. */
  token?: string
  /** HTTP request timeout. */
  timeout?: number
}

/**
 * Request API error.
 * Corresponds to https://github.com/edge/misc-utils/blob/master/lib/http.ts
 */
export class RequestError extends Error {
  data
  xhr

  /** Create a request API error. */
  constructor(message: string, data?: Record<string, unknown>, xhr?: XMLHttpRequest) {
    super(message)
    this.name = 'RequestError'
    this.data = data
    this.xhr = xhr
  }

  /**
   * Create a request API error by parsing a XMLHTTPRequest (which is presumed to have completed).
   *
   * If the response is a standard REST error, the JSON message will be attached automatically to the RequestError.
   * Any additional properties will be attached as data.
   * See `error` in <https://github.com/edge/misc-utils/blob/master/lib/http.ts> for more detail.
   *
   * If the response is not a standard REST error then YMMV.
   */
  static parse(xhr: XMLHttpRequest) {
    let message = xhr.status.toString()
    let data: Record<string, unknown> | undefined = undefined

    if (xhr.getResponseHeader('content-type')?.includes('application/json')) {
      const res = JSON.parse(xhr.response)
      if (isObject(res)) {
        if (res.message && typeof res.message === 'string') message = res.message
        data = {}
        for (const key in res) {
          if (key === 'message') continue
          data[key] = res[key]
        }
      }
    }


    return new this(message, data, xhr)
  }
}

/** Search and pagination parameters. */
export interface SearchParams {
  limit?: number
  page?: number
  search?: string
  sort?: string[]
}

/** Standard response structure for search APIs. */
export interface SearchResponse<T> {
  results: T[]
  metadata: {
    limit: number
    page: number
    totalCount: number
  }
}

/** Make properties of T in the union K required, while making other properties optional. */
export type SomeRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>

/** Simple object check for internal use only. */
function isObject(data: unknown) {
  return typeof data === 'object' && !(data instanceof Array) && data !== null
}

/** Convert URLSearch params to named search parameters. */
export function readSearchParams(up: URLSearchParams): SearchParams {
  const params: SearchParams = {}

  if (up.has('limit')) params.limit = parseInt(up.get('limit') as string)
  if (up.has('page')) params.page = parseInt(up.get('page') as string)
  if (up.has('search')) params.search = up.get('search') as string

  if (up.has('sort')) params.sort = up.getAll('sort')

  return params
}

/**
 * Perform an HTTP request to Herda Server REST API.
 * This method should not normally be used directly outside of this package.
 */
export function request<T>(opt: Options, method: Method, path: string, params?: URLSearchParams, body?: unknown): Promise<T> {
  let url = `${opt.host}${path}`
  if (params) url = `${url}?${params.toString()}`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.getResponseHeader('Content-Type')?.startsWith('application/json')) {
          resolve(JSON.parse(xhr.response))
        } else resolve(xhr.response)
      } else reject(RequestError.parse(xhr))
    })

    xhr.addEventListener('error', reject)

    if (opt.timeout) xhr.timeout = opt.timeout

    xhr.open(method, url)

    xhr.setRequestHeader('Accept', 'application/json')
    if (opt.token) xhr.setRequestHeader('Authorization', `Bearer ${opt.token}`)

    if (typeof body === 'string') xhr.send(body)
    else if (typeof body === 'object') {
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(body))
    } else if (body !== undefined) {
      reject(new Error('invalid body'))
    } else xhr.send()
  })
}

/** Convert named search parameters object to URLSearchParams. */
export function writeSearchParams(params: SearchParams): URLSearchParams {
  const up = new URLSearchParams()

  if (params.limit !== undefined) up.append('limit', `${params.limit}`)
  if (params.page !== undefined) up.append('page', `${params.page}`)
  if (params.search !== undefined) up.append('search', params.search)

  if (params.sort !== undefined) {
    for (const sort of params.sort) up.append('sort', sort)
  }

  return up
}

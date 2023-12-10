import type { Options, SearchParams, SearchResponse, SomeRequired, WithId } from './lib'
import { request, writeSearchParams } from './lib'

/** Herd data. */
export interface Herd {
  /** Account ID. */
  _account: string
  /** Name. */
  name: string
}

/** Create herd request data. */
export interface CreateHerdRequest {
  herd: SomeRequired<Herd, '_account' | 'name'>
}

/** Create herd response data. */
export interface CreateHerdResponse {
  herd: WithId<Herd>
}

/** Delete herd response data. */
export interface DeleteHerdResponse {
  herd: WithId<Herd>
  tasks: {
    deletedCount: number
  }
}

/** Get herd response data. */
export interface GetHerdResponse {
  herd: WithId<Herd>
}

/** Update herd request data. */
export interface UpdateHerdRequest {
  herd: Partial<Herd>
}

/** Update herd response data. */
export interface UpdateHerdResponse {
  herd: WithId<Herd>
}

/** Create a herd. */
export async function createHerd(opt: Options, data: CreateHerdRequest): Promise<CreateHerdResponse> {
  return request(opt, 'POST', '/herd', undefined, data)
}

/** Delete a herd. */
export async function deleteHerd(opt: Options, id: string): Promise<DeleteHerdResponse> {
  return request(opt, 'DELETE', `/herd/${id}`)
}

/** Get a herd. */
export async function getHerd(opt: Options, id: string): Promise<GetHerdResponse> {
  return request(opt, 'GET', `/herd/${id}`)
}

/** Search herds. */
export async function searchHerds(opt: Options, params?: SearchParams): Promise<SearchResponse<GetHerdResponse>> {
  return request(opt, 'GET', '/herds', params && writeSearchParams(params))
}

/** Update a herd. */
export async function updateHerd(opt: Options, id: string, data: UpdateHerdRequest): Promise<UpdateHerdResponse> {
  return request(opt, 'PUT', `/herd/${id}`, undefined, data)
}

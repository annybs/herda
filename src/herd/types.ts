import type { ObjectId } from 'mongodb'

/** Herd data. */
export interface Herd<T extends ObjectId | string = ObjectId> {
  /** Account ID. */
  _account: T
  /** Name. */
  name: string
}

/** Subset of herd data when creating a new herd. */
export type HerdCreate<T extends ObjectId | string = ObjectId> = Pick<Herd<T>, '_account' | 'name'>

/** Subset of herd data when updating a herd. */
export type HerdUpdate<T extends ObjectId | string = ObjectId> = Partial<Pick<Herd<T>, '_account' | 'name'>>

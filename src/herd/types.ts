import type { ObjectId } from 'mongodb'

/** Herd data. */
export interface Herd {
  /** Account ID. */
  _account: ObjectId
  /** Name. */
  name: string
}

/** Subset of herd data when creating a new herd. */
export type HerdCreate = Pick<Herd, '_account' | 'name'>

/** Subset of herd data when updating a herd. */
export type HerdUpdate = Partial<Pick<Herd, 'name'>>

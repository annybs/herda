import type { Account } from './types'
import type { WithId } from 'mongodb'

/**
 * Prepare an account for display via API.
 * This prevents sensitive fields being exposed.
 */
export function prepareAccount(account: WithId<Account>): WithId<Partial<Account>> {
  return {
    _id: account._id,
    email: account.email,
  }
}

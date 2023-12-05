/** Account data. */
export interface Account {
  /** Email address. Used for authentication. */
  email: string
  /** Password. Used for authentication. */
  password: string
  /** Password salt. Used for authentication. */
  passwordSalt: string
}

/** Subset of account data when creating a new account. */
export type AccountCreate = Pick<Account, 'email' | 'password'>

/** Subset of account data when updating an account. */
export type AccountUpdate = Partial<Pick<Account, 'email' | 'password'>>

export interface Account {
  email: string
  password: string
  passwordSalt: string
}

export type AccountCreate = Pick<Account, 'email' | 'password'>

export type AccountUpdate = Partial<Pick<Account, 'email' | 'password'>>

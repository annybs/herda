import { request } from './lib'
import type { Options, WithId } from './lib'

/** Account data. */
export interface Account {
  /** Email address. Used for authentication. */
  email: string
}

/** Create account request data. */
export interface CreateAccountRequest {
  account: Account & {
    password: string
  }
}

/** Create account response data. */
export interface CreateAccountResponse {
  account: WithId<Account>
}

/** Delete account response data. */
export interface DeleteAccountResponse {
  account: WithId<Account>
  herds: {
    deletedCount: number
  }
  tasks: {
    deletedCount: number
  }
}

/** Get account response data. */
export interface GetAccountResponse {
  account: WithId<Account>
}

/** Account login request data. */
export interface LoginAccountRequest {
  account: Account & {
    password: string
  }
}

/** Account login response data. */
export interface LoginAccountResponse {
  token: string
  account: WithId<Account>
}

/** Update account request data. */
export interface UpdateAccountRequest {
  account: Partial<Account> & {
    password?: string
  }
}

/** Update account response data. */
export interface UpdateAccountResponse {
  account: WithId<Account>
}

/** Create an account. */
export async function createAccount(opt: Options, data: CreateAccountRequest): Promise<CreateAccountResponse> {
  return request(opt, 'POST', '/account', undefined, data)
}

/** Delete an account. */
export async function deleteAccount(opt: Options, id?: string): Promise<DeleteAccountResponse> {
  return request(opt, 'DELETE', id ? `/account/${id}` : '/account')
}

/** Get an account. */
export async function getAccount(opt: Options, id?: string): Promise<GetAccountResponse> {
  return request(opt, 'GET', id ? `/account/${id}` : '/account')
}

/** Log in to an account. */
export async function loginAccount(opt: Options, data: LoginAccountRequest): Promise<LoginAccountResponse> {
  return request(opt, 'POST', '/login/account', undefined, data)
}

/** Update an account. */
export async function updateAccount(opt: Options, id: string | undefined, data: UpdateAccountRequest): Promise<UpdateAccountResponse> {
  return request(opt, 'PUT', id ? `/account/${id}` : '/account', undefined, data)
}

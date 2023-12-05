import type { Context } from '../types'
import type { RequestHandler } from 'express'

export function createAccount(ctx: Context): RequestHandler {
  return function (req, res, next) {
    res.send('Create account WIP')
    next()
  }
}

export function deleteAccount(ctx: Context): RequestHandler {
  return function (req, res, next) {
    res.send('Delete account WIP')
    next()
  }
}

export function getAccount(ctx: Context): RequestHandler {
  return function (req, res, next) {
    res.send('Get account WIP')
    next()
  }
}

export function updateAccount(ctx: Context): RequestHandler {
  return function (req, res, next) {
    res.send('Update account WIP')
    next()
  }
}

import * as v from '../validate'
import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { WithId } from 'mongodb'
import type { Task, TaskCreate, TaskUpdate } from './types'
import { sendBadRequest, sendForbidden, sendNotFound, sendUnauthorized } from '../http'

/** Create a task. */
export function createTask({ model }: Context): AuthRequestHandler {
  interface RequestData {
    task: TaskCreate<string>
  }

  interface ResponseData {
    task: WithId<Task>
  }

  const readRequestData = v.validate<RequestData>({
    task: {
      _herd: v.seq(v.str, v.exactLength(24)),
      _account: v.seq(v.str, v.exactLength(24)),
      description: v.seq(v.str, v.minLength(1)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Read input
      const input = readRequestData(req.body)

      // Assert ability to assign task
      if (!req.account._id.equals(input.task._account)) return sendForbidden(res, next)

      // Assert access to herd
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(input.task._herd) })
      if (!herd) return sendNotFound(res, next, { reason: 'herd not found' })
      if (!req.account._id.equals(herd._account)) return sendForbidden(res, next)

      const task = await model.task.create({
        ...input.task,
        _herd: new ObjectId(input.task._herd),
        _account: new ObjectId(input.task._account),
      })
      if (!task) return sendNotFound(res, next, { reason: 'unexpectedly failed to get new task' })

      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return sendBadRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}

/** Delete a task. */
export function deleteTask({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    task: WithId<Task>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to task
      const task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return sendNotFound(res, next)
      if (!req.account._id.equals(task._account)) return sendForbidden(res, next)

      // Delete task
      await model.task.collection.deleteOne({ _id: task._id })

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      next(err)
    }
  }
}

/** Get a task. */
export function getTask({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    task: WithId<Task>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to task
      const task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return sendNotFound(res, next)
      if (!req.account._id.equals(task._account)) return sendForbidden(res, next)

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/** Update a task. */
export function updateTask({ model }: Context): AuthRequestHandler {
  interface RequestData {
    task: TaskUpdate<string>
  }

  interface ResponseData {
    task: WithId<Task>
  }

  const readRequestData = v.validate<RequestData>({
    task: {
      _herd: v.seq(v.optional, v.str, v.exactLength(24)),
      _account: v.seq(v.optional, v.str, v.exactLength(24)),
      description: v.seq(v.optional, v.str, v.minLength(1)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to task
      let task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return sendNotFound(res, next)
      if (!req.account._id.equals(task._account)) return sendForbidden(res, next)

      // Read input
      const input = readRequestData(req.body)
      if (Object.keys(input.task).length < 1) {
        return sendBadRequest(res, next, { reason: 'no changes' })
      }

      // Assert ability to assign task, if specified in update
      if (input.task._account) {
        if (!req.account._id.equals(input.task._account)) return sendForbidden(res, next)
      }

      // Assert access to herd, if specified in update
      if (input.task._herd) {
        const herd = await model.task.collection.findOne({ _id: new ObjectId(input.task._herd) })
        if (!herd) return sendNotFound(res, next, { reason: 'herd not found' })
        if (!req.account._id.equals(herd._account)) return sendForbidden(res, next)
      }

      // Update task
      task = await model.task.update(task._id, {
        ...input.task,
        _herd: input.task._herd && new ObjectId(input.task._herd) || undefined,
        _account: input.task._account && new ObjectId(input.task._account) || undefined,
      })
      if (!task) return sendNotFound(res, next)

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return sendBadRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}

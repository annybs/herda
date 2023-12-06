import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { SearchResult } from '../api'
import type { WithId } from 'mongodb'
import type { Task, TaskCreate, TaskUpdate } from './types'
import { http, query, validate as v } from '@edge/misc-utils'

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
      position: v.seq(v.optional, v.numeric, v.min(1)),
      done: v.seq(v.optional, v.bool),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Read input
      const input = readRequestData(req.body)

      // Assert ability to assign task
      if (!req.account._id.equals(input.task._account)) return http.forbidden(res, next)

      // Assert access to herd
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(input.task._herd) })
      if (!herd) return http.notFound(res, next, { reason: 'herd not found' })
      if (!req.account._id.equals(herd._account)) return http.forbidden(res, next)

      const task = await model.task.create({
        ...input.task,
        _herd: new ObjectId(input.task._herd),
        _account: new ObjectId(input.task._account),
      })
      if (!task) return http.notFound(res, next, { reason: 'unexpectedly failed to get new task' })

      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return http.badRequest(res, next, { param: ve.param, reason: ve.message })
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
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Assert access to task
      const task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return http.notFound(res, next)
      if (!req.account._id.equals(task._account)) return http.forbidden(res, next)

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
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Assert access to task
      const task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return http.notFound(res, next)
      if (!req.account._id.equals(task._account)) return http.forbidden(res, next)

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/**
 * Move task within a herd.
 * This updates the task's position, and also updates the position of any tasks after it.
 */
export function moveTask({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    task: WithId<Task>
    tasks: {
      /** Number of tasks affected, including the original task */
      affectedCount: number
    }
  }

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Read position parameter
      if (!req.params.position) return http.badRequest(res, next)
      const position = parseInt(req.params.position)
      if (isNaN(position) || position < 1) return http.badRequest(res, next)

      // Assert access to task
      const task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return http.notFound(res, next)
      if (!req.account._id.equals(task._account)) return http.forbidden(res, next)

      // Update task
      const result = await model.task.move(task._id, position)

      // Send output
      const output: ResponseData = {
        task: result.task,
        tasks: {
          affectedCount: result.affectedCount,
        },
      }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/** Search tasks. */
export function searchTasks({ model }: Context): AuthRequestHandler {
  type ResponseData = SearchResult<{
    task: WithId<Task>
  }>

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    // Read parameters
    const herd = req.params.herd || undefined
    const limit = query.integer(req.query.limit, 1, 100) || 10
    const page = query.integer(req.query.page, 1) || 1
    const search = query.str(req.query.search)
    const sort = query.sorts(req.query.sort, ['description', 'position'], ['position', 'ASC'])

    // Build filters and skip
    const filter: Record<string, unknown> = {
      _account: req.account._id,
    }
    if (herd) {
      // Add herd filter if set.
      // We don't need to verify access as it is implicitly asserted by the _account filter
      try {
        filter._herd = new ObjectId(herd)
      } catch (err) {
        return http.badRequest(res, next, { reason: 'invalid herd' })
      }
    }
    if (search) filter.$text = { $search: search }
    const skip = (page - 1) * limit

    try {
      // Get total documents count for filter
      const totalCount = await model.herd.collection.countDocuments(filter)

      // Build cursor
      let cursor = model.task.collection.find(filter)
      for (const [prop, dir] of sort) {
        cursor = cursor.sort(prop, dir === 'ASC' ? 1 : -1)
      }
      cursor = cursor.skip(skip).limit(limit)

      // Get results and send output
      const data = await cursor.toArray()
      const output: ResponseData = {
        results: data.map(task => ({ task })),
        metadata: { limit, page, totalCount },
      }
      res.send(output)
      next()
    } catch (err) {
      next(err)
    }
  }
}

/**
 * Toggle task done flag.
 * If the task is not done, it will become done, and vice versa.
 */
export function toggleTaskDone({ model }: Context): AuthRequestHandler {
  type ResponseData = {
    task: WithId<Task>
  }

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Assert access to task
      let task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return http.notFound(res, next)
      if (!req.account._id.equals(task._account)) return http.forbidden(res, next)

      // Update to switch task done status
      task = await model.task.collection.findOneAndUpdate({ _id: task._id }, { $set: { done: !task.done }}, { returnDocument: 'after' })
      if (!task) throw new Error('failed to get updated task')

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      next(err)
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
      position: v.seq(v.optional, v.numeric, v.min(1)),
      done: v.seq(v.optional, v.bool),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    try {
      // Assert access to task
      let task = await model.task.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!task) return http.notFound(res, next)
      if (!req.account._id.equals(task._account)) return http.forbidden(res, next)

      // Read input
      const input = readRequestData(req.body)
      if (Object.keys(input.task).length < 1) {
        return http.badRequest(res, next, { reason: 'no changes' })
      }

      // Assert ability to assign task, if specified in update
      if (input.task._account) {
        if (!req.account._id.equals(input.task._account)) return http.forbidden(res, next)
      }

      // Assert access to herd, if specified in update
      if (input.task._herd) {
        const herd = await model.task.collection.findOne({ _id: new ObjectId(input.task._herd) })
        if (!herd) return http.notFound(res, next, { reason: 'herd not found' })
        if (!req.account._id.equals(herd._account)) return http.forbidden(res, next)
      }

      // Update task
      task = await model.task.update(task._id, {
        ...input.task,
        _herd: input.task._herd && new ObjectId(input.task._herd) || undefined,
        _account: input.task._account && new ObjectId(input.task._account) || undefined,
      })
      if (!task) return http.notFound(res, next)

      // Send output
      const output: ResponseData = { task }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return http.badRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}

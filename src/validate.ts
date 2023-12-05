/**
 * IMPORTED EXTERNAL LIB - DO NOT MODIFY
 */

/**
 * Validation specification.
 * Given an object type, a specification outline is derived to ensure that validation is defined for all scalar
 * properties.
 *
 * If a property is array-type, a single validator must be specified which receives the entire array.
 * If a property is otherwise object-type, the validation spec extends deeply into it.
 *
 * Optional properties must still be specified; the `optional()` function can be used to allow them to be skipped if
 * the value is undefined.
 */
export type Spec<T> =
  T extends Array<unknown>
    ? ValidateFn
    : T extends object
      ? { [P in keyof Required<T>]: Spec<T[P]> }
      : ValidateFn

/** Validation error thrown by `validate()`. Provides the failed parameter along with the error message. */
export class ValidateError extends Error {
  param: string

  constructor(param: string, message: string) {
    super(message)
    this.name = 'ValidateError'
    this.param = param
  }
}

/**
 * A validation function takes any input and throws an error if it does not satisfy the relevant condition.
 *
 * It may return `true` signifying that further validation is not required; see `seq()` for more detail.
 *
 * When used in conjunction with `validate()` to parse an object, an `origInput` is also passed giving the entire
 * data object.
 * This can be used to validate one property based on the value of another, though as the type of the parent input
 * is `unknown` knowledge of the structure has to be asserted by the caller.
 */
export type ValidateFn = (input: unknown, origInput?: unknown) => true | void

/** Validate input is Boolean. */
export const bool: ValidateFn = input => {
  if (typeof input !== 'boolean') throw new Error('must be boolean')
}

/**
 * FQDN format expression.
 *
 * Based on https://stackoverflow.com/a/62917037/1717753
 */
const domainRegexp = /^((?=[a-z0-9-_]{1,63}\.)(xn--)?[a-z0-9_]+(-[a-z0-9_]+)*\.)+[a-z]{2,63}$/

/**
 * Validate input is a fully-qualified domain name.
 * Implicitly validates `str()` for convenience.
 */
export const domain: ValidateFn = input => {
  str(input)
  if (!domainRegexp.test(input as string)) throw new Error('invalid domain')
}

/** Email format expression. */
const emailRegexp = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Validate input is an email address.
 * Implicitly validates `str()` for convenience.
 */
export const email: ValidateFn = input => {
  str(input)
  if (!emailRegexp.test(input as string)) throw new Error('invalid email address')
}

/** Validate input is exactly equal to a comparison value. */
export const eq = <T>(cmp: T): ValidateFn => input => {
  if (input !== cmp) throw new Error(`must be ${cmp}`)
}

/** Validate exact length of string. */
export const exactLength = (n: number): ValidateFn => input => {
  if ((input as string).length !== n) throw new Error(`must contain exactly ${n} characters`)
}

/** Lowercase hexadecimal expression. */
const hexRegexp = /^[a-f0-9]*$/

/**
 * Validate string is lowercase hexadecimal.
 * Implicitly validates `str()` for convenience.
 */
export const hex: ValidateFn = input => {
  str(input)
  if (!hexRegexp.test(input as string)) throw new Error('invalid characters')
}

/**
 * Validate input is an integer.
 * Implicitly validates `numeric()` for convenience.
 */
export const integer: ValidateFn = input => {
  numeric(input)
  if ((input as number).toString().indexOf('.') > -1) throw new Error('must be an integer')
}

/** Validate maximum number. */
export const max = (n: number): ValidateFn => input => {
  if (input as number > n) throw new Error(`must be no more than ${n}`)
}

/** Validate maximum length of string. */
export const maxLength = (n: number): ValidateFn => input => {
  if ((input as string).length > n) throw new Error(`must be no longer than ${n} characters`)
}

/** Validate minimum number. */
export const min = (n: number): ValidateFn => input => {
  if (input as number < n) throw new Error(`must be no less than ${n}`)
}

/** Validate minimum length of string. */
export const minLength = (n: number): ValidateFn => input => {
  if ((input as string).length < n) throw new Error(`must be no shorter than ${n} characters`)
}

/** Validate input is numeric. */
export const numeric: ValidateFn = input => {
  if (typeof input !== 'number') throw new Error('must be a number')
}

/** Validate input is one of a range of options. */
export const oneOf = <T>(range: T[]): ValidateFn => input => {
  if (!range.includes(input as T)) throw new Error(`must be one of: ${range.join(', ')}`)
}

/**
 * Special non-validator that returns true if the input is null or undefined, and never throws an error.
 * Normally used with `seq()`.
 */
export const optional: ValidateFn = input => {
  if (input === null || input === undefined) return true
}

/** Validate string against regular expression. */
export const regexp = (re: RegExp): ValidateFn => input => {
  if (!re.test(input as string)) throw new Error('invalid characters')
}

/**
 * Sequentially runs multiple validation functions.
 * If a function returns true, for example `optional()`, subsequent validation is ignored.
 */
export const seq = (...fs: ValidateFn[]): ValidateFn => (input, origInput) => {
  for (let i = 0; i < fs.length; i++) {
    if (fs[i](input, origInput)) return
  }
}

/** Validate input is a string. */
export const str: ValidateFn = input => {
  if (typeof input !== 'string') throw new Error('must be a string')
}

/**
 * Read an unknown input and assert it matches an object specification.
 * This function immediately throws a ValidateError if any validation fails.
 * Otherwise, a typed copy of the input is returned.
 *
 * This method does not support validation across multiple properties or asynchronous validation.
 *
 * @todo Remove usage of `any` type.
 */
export const validate = <T extends object>(spec: Spec<Required<T>>, parent = '') =>
  (input: unknown, origInput?: unknown): T => {
    type V = keyof Spec<Required<T>>
    type I = keyof T
    if (typeof input !== 'object' || input === null) throw new Error('no data')
    return Object.keys(spec).reduce((v, k) => {
      const f = spec[k as V]
      const value = (input as T)[k as I]
      if (typeof f === 'function') {
        try {
          f(value, origInput || input)
          v[k as I] = value
        } catch (err) {
          const param = parent ? `${parent}.${k}` : k
          throw new ValidateError(param, (err as Error).message)
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        v[k as I] = validate(f as any, k as string)(value as any, origInput || input) as any
      }
      return v
    }, <T>{})
  }

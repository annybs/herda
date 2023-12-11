/** Email format expression. */
const emailRegexp = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Validate input is an email address.
 * Implicitly validates `str()` for convenience.
 */
export function email(input: string | undefined) {
  if (!input) return
  if (!emailRegexp.test(input as string)) return 'invalid email address'
}

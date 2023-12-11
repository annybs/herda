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

const passwordConfig = {
  exprChars: /[A-z]/g,
  exprNums: /\d/g,
  exprSymbols: /[!@#$%^&*(){}[\]:;"',./<>?~_-]/g,
  minLength: 8,
  minChars: 4,
  minNumbers: 1,
  minSymbols: 1,
}

/** Validate a password, including basic complexity requirements. */
export function password(input: string | undefined) {
  if (!input) return
  if (input.length < passwordConfig.minLength) return `Must be at least ${passwordConfig.minLength} characters`

  const chars = input.match(passwordConfig.exprChars)
  if (!chars || chars.length < passwordConfig.minChars) return 'Not enough letters'

  const nums = input.match(passwordConfig.exprNums)
  if (!nums || nums.length < passwordConfig.minNumbers) return 'Not enough numbers'

  const symbols = input.match(passwordConfig.exprSymbols)
  if (!symbols || symbols.length < passwordConfig.minSymbols) return 'Not enough symbols'
}

/** Validate the length of a password only. */
export function passwordLength(input: string | undefined) {
  if (!input) return
  if (input.length < passwordConfig.minLength) return `Must be at least ${passwordConfig.minLength} characters`
}

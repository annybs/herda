import { validate } from '@edge/misc-utils'

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
export const password: validate.ValidateFn = input => {
  validate.seq(validate.str, validate.minLength(passwordConfig.minLength))
  const password = input as string

  const chars = password.match(passwordConfig.exprChars)
  if (!chars || chars.length < passwordConfig.minChars) throw new Error('not enough letters')

  const nums = password.match(passwordConfig.exprNums)
  if (!nums || nums.length < passwordConfig.minNumbers) throw new Error('not enough numbers')

  const symbols = password.match(passwordConfig.exprSymbols)
  if (!symbols || symbols.length < passwordConfig.minSymbols) throw new Error('not enough symbols')
}

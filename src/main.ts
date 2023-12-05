import { Config, Context } from "./types";

/**
 * Server application entrypoint.
 */
export async function main(config: Config) {
  // Initialize context
  const ctx = <Context>{ config }

  console.log(ctx)
  throw new Error('Work in progress')
}

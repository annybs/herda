export interface ValueStorage<T> {
  del(): void
  exists(): boolean
  get(): T | undefined
  set(value: T): void
}

export function localValueStorage(key: string) {
  function del() {
    localStorage.removeItem(key)
  }

  function exists() {
    return localStorage.getItem(key) !== null
  }

  function get() {
    const data = localStorage.getItem(key)
    if (data === null) return undefined
    const value = JSON.parse(data)
    return value
  }

  function set<T>(value: T) {
    const data = JSON.stringify(value)
    localStorage.setItem(key, data)
  }

  return { del, exists, get, set }
}

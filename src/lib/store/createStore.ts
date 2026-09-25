import { useSyncExternalStore } from 'react'

type Listener<T> = (state: T, prev: T) => void

export function createStore<T extends object>(initial: T) {
  let state = initial
  const listeners = new Set<Listener<T>>()

  const get = () => state
  const set = (partial: Partial<T> | ((s: T) => Partial<T>)) => {
    const next = typeof partial === 'function' ? partial(state) : partial
    const prev = state
    state = { ...state, ...next }
    listeners.forEach((l) => l(state, prev))
  }
  const subscribe = (l: Listener<T>) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }

  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    )
  }

  /** Subscribe to a slice outside React (used by the map to avoid re-renders). */
  function watch<S>(selector: (s: T) => S, cb: (next: S, prev: S) => void) {
    return subscribe((s, p) => {
      const a = selector(s)
      const b = selector(p)
      if (!Object.is(a, b)) cb(a, b)
    })
  }

  return { get, set, subscribe, useStore, watch }
}

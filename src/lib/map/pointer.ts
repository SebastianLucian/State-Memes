/** Pointer position over the map, broadcast without touching React. */
type P = { x: number; y: number; lng: number; lat: number }
const listeners = new Set<(p: P) => void>()
export const pointer = {
  emit(p: P) {
    listeners.forEach((l) => l(p))
  },
  on(l: (p: P) => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

import { useCallback } from 'react'
import { appStore, useApp } from '../lib/store/appStore'

export function useStateSelection() {
  const selectedId = useApp((s) => s.selectedId)
  const select = useCallback((id: string) => appStore.set({ selectedId: id }), [])
  const clear = useCallback(() => appStore.set({ selectedId: null }), [])
  return { selectedId, select, clear }
}

import { useEffect } from 'react'
import { appStore } from '../../lib/store/appStore'
import type { TerritoryController } from '../../lib/map/territory'

/**
 * Keeps token territories in step with market data. Changes arrive as a store
 * slice and are handed to the controller, which animates them in feature-state.
 */
export function TerritoryLayer({ territory }: { territory: TerritoryController }) {
  useEffect(() => {
    territory.sync(appStore.get().summaries, { quiet: true })
    return appStore.watch(
      (s) => s.summaries,
      (summaries) => territory.sync(summaries, { skip: appStore.get().claiming ?? undefined }),
    )
  }, [territory])
  return null
}

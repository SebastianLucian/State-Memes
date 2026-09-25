import type { Map as MLMap } from 'maplibre-gl'
import type { TerritoryController } from './territory'

/** The live map instance, shared with imperative sequences (e.g. the launch celebration). */
export const mapRuntime: { map: MLMap | null; territory: TerritoryController | null } = {
  map: null,
  territory: null,
}

if (import.meta.env.DEV) (globalThis as unknown as { __frontier: typeof mapRuntime }).__frontier = mapRuntime

import { useEffect } from 'react'
import type { Map as MLMap, MapLayerMouseEvent } from 'maplibre-gl'
import { appStore } from '../../lib/store/appStore'
import { L } from '../../lib/map/layers'
import { pointer } from '../../lib/map/pointer'
import { focusState, resetView } from '../../lib/map/camera'
import type { TerritoryController } from '../../lib/map/territory'
import { useStateSelection } from '../../hooks/useStateSelection'

/**
 * State interactivity: hover, click, selection and camera. Renders nothing —
 * it wires MapLibre events to the store and the store back to feature-state.
 */
export function StateLayer({ map, territory }: { map: MLMap; territory: TerritoryController }) {
  const { select, clear } = useStateSelection()

  useEffect(() => {
    const canvas = map.getCanvasContainer().parentElement!
    let hovered: string | null = null

    const setHovered = (id: string | null) => {
      if (id === hovered) return
      hovered = id
      appStore.set({ hoveredId: id })
      canvas.classList.toggle('map-hovering', !!id)
    }

    const onMove = (e: MapLayerMouseEvent) => {
      const id = (e.features?.[0]?.id as string | undefined) ?? null
      setHovered(id)
    }
    const onLeave = () => setHovered(null)
    const onAnyMove = (e: MapLayerMouseEvent) =>
      pointer.emit({ x: e.point.x, y: e.point.y, lng: e.lngLat.lng, lat: e.lngLat.lat })

    const onClick = (e: MapLayerMouseEvent) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: [L.base] })[0]
      const id = (hit?.id as string | undefined) ?? null
      const s = appStore.get()
      if (s.picking) {
        if (!id) return
        appStore.set({ picking: false, launch: { ...s.launch, stateId: id, open: true } })
        select(id)
        return
      }
      if (id) select(id)
      else if (s.selectedId) clear()
    }

    map.on('mousemove', L.base, onMove)
    map.on('mouseleave', L.base, onLeave)
    map.on('mousemove', onAnyMove)
    map.on('click', onClick)

    // Store → map
    const offHover = appStore.watch(
      (s) => s.hoveredId,
      (id, prev) => territory.hover(id, prev),
    )
    const offSelect = appStore.watch(
      (s) => s.selectedId,
      (id) => {
        territory.select(id)
        if (id) focusState(map, id)
        else resetView(map)
      },
    )
    const offPicking = appStore.watch(
      (s) => s.picking,
      (p) => canvas.classList.toggle('map-picking', p),
    )

    return () => {
      map.off('mousemove', L.base, onMove)
      map.off('mouseleave', L.base, onLeave)
      map.off('mousemove', onAnyMove)
      map.off('click', onClick)
      offHover()
      offSelect()
      offPicking()
    }
  }, [map, territory, select, clear])

  return null
}

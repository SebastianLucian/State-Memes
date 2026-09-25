import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon, Position } from 'geojson'
import statesTopo from 'us-atlas/states-10m.json'
import { STATES, STATE_BY_FIPS } from '../../data/states'
import { inkify } from './palette'

export type StateFeatureProps = { id: string; name: string; small: boolean }

// States whose full name crowds the national view.
const SMALL = new Set(['RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'VT', 'NH', 'DC'])

/** Keep the Aleutians on the same side of the antimeridian as the rest of Alaska. */
function unwrapAlaska(coords: Position[][][]): Position[][][] {
  return coords.map((poly) => poly.map((ring) => ring.map(([x, y]) => [x > 0 ? x - 360 : x, y])))
}

let cached: FeatureCollection<Polygon | MultiPolygon, StateFeatureProps> | null = null

export function getStateShapes() {
  if (cached) return cached
  const topo = statesTopo as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>
  const fc = feature(topo, topo.objects.states) as FeatureCollection<Polygon | MultiPolygon, { name: string }>
  const features: Feature<Polygon | MultiPolygon, StateFeatureProps>[] = []
  for (const f of fc.features) {
    const info = STATE_BY_FIPS[String(f.id)]
    if (!info) continue // DC and territories: not part of the fifty.
    let geometry = f.geometry
    if (info.id === 'AK') {
      const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
      geometry = { type: 'MultiPolygon', coordinates: unwrapAlaska(polys) }
    }
    features.push({
      type: 'Feature',
      id: info.id,
      geometry,
      properties: { id: info.id, name: info.name, small: SMALL.has(info.id) },
    })
  }
  cached = { type: 'FeatureCollection', features }
  return cached
}

export type LabelProps = { id: string; name: string; small: boolean; ticker: string; color: string }

export function buildLabelPoints(leaders: Record<string, { symbol: string; color: string } | null>) {
  const features: Feature<Point, LabelProps>[] = STATES.map((s) => ({
    type: 'Feature',
    id: s.id,
    geometry: { type: 'Point', coordinates: s.label },
    properties: {
      id: s.id,
      name: s.name.toUpperCase(),
      small: SMALL.has(s.id),
      ticker: leaders[s.id] ? `$${leaders[s.id]!.symbol}` : '',
      color: leaders[s.id] ? inkify(leaders[s.id]!.color) : '#171614',
    },
  }))
  return { type: 'FeatureCollection', features } as FeatureCollection<Point, LabelProps>
}

/** Bounding box for a state, used to frame the camera. */
const BOUNDS_OVERRIDE: Record<string, [[number, number], [number, number]]> = {
  // The remote islands stretch these far beyond what anyone wants framed.
  AK: [
    [-169, 52],
    [-130, 71.4],
  ],
  HI: [
    [-160.4, 18.8],
    [-154.7, 22.3],
  ],
}

export function stateBounds(id: string): [[number, number], [number, number]] | null {
  if (BOUNDS_OVERRIDE[id]) return BOUNDS_OVERRIDE[id]
  const f = getStateShapes().features.find((x) => x.id === id)
  if (!f) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys)
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  return [
    [minX, minY],
    [maxX, maxY],
  ]
}

export const CONUS_BOUNDS: [[number, number], [number, number]] = [
  [-125.0, 24.4],
  [-66.9, 49.4],
]

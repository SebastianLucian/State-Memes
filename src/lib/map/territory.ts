import type { GeoJSONSource, Map as MLMap } from 'maplibre-gl'
import { STATES } from '../../data/states'
import { gsap } from '../animation/easing'
import type { StateSummary } from '../../services/types'
import { SRC_LABELS, SRC_STATES } from './layers'
import { buildLabelPoints } from './geometry'
import { hexToRgb } from './palette'
import {
  hoverState,
  selectState,
  territoryChange,
  territoryExpand,
  territoryShift,
  type TerritoryTarget,
  type TerritoryVisual,
} from '../animation/territory'

type Interaction = { hover: number; sel: number; dim: number; mute: number }

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** How strongly a token's ink marks the land, from its dominance. */
export function territoryTarget(summary: StateSummary | undefined): TerritoryTarget {
  const leader = summary?.leader
  if (!leader) return { r: 41, g: 59, b: 74, wash: 0, stipple: 0, hatch: 0, contour: 0 }
  const d = summary.dominance
  const { r, g, b } = hexToRgb(leader.color)
  const strength = Math.pow(clamp01((d - 0.2) / 0.8), 0.9)
  return {
    r,
    g,
    b,
    wash: 0.07 + 0.25 * strength,
    stipple: 0.04 + 0.24 * Math.pow(d, 1.7),
    hatch: summary.tokens.length > 1 && d < 0.62 ? Math.min(0.24, (0.62 - d) * 0.9) : 0,
    contour: 0.14 + 0.36 * d,
  }
}

/**
 * Owns every per-state visual on the map. Writes MapLibre feature-state
 * directly, so React never re-renders the map for hover, selection or
 * territory animation.
 */
export class TerritoryController {
  private visuals: Record<string, TerritoryVisual> = {}
  private inter: Record<string, Interaction> = {}
  private leaders: Record<string, { id: string; symbol: string; color: string } | null> = {}
  private initialised = false

  constructor(private map: MLMap) {
    for (const s of STATES) {
      this.visuals[s.id] = { r: 41, g: 59, b: 74, wash: 0, stipple: 0, hatch: 0, contour: 0, bleed: 0, tick: 1 }
      this.inter[s.id] = { hover: 0, sel: 0, dim: 0, mute: 0 }
      this.leaders[s.id] = null
    }
  }

  private write(id: string) {
    const v = this.visuals[id]
    const i = this.inter[id]
    this.map.setFeatureState(
      { source: SRC_STATES, id },
      {
        r: v.r,
        g: v.g,
        b: v.b,
        wash: v.wash * (1 - i.dim * 0.55) * (1 + i.sel * 0.3),
        stipple: v.stipple * (1 - i.dim * 0.6),
        hatch: v.hatch * (1 - i.dim * 0.6),
        contour: v.contour * (1 - i.dim * 0.5),
        bleed: v.bleed,
        hover: i.hover,
        sel: i.sel,
        dim: i.dim,
      },
    )
    this.map.setFeatureState({ source: SRC_LABELS, id }, { tick: v.tick, hover: i.hover, dim: i.dim, mute: i.mute })
  }

  private pushLabels() {
    const src = this.map.getSource(SRC_LABELS) as GeoJSONSource | undefined
    src?.setData(buildLabelPoints(this.leaders))
  }

  /** Reconcile the map with fresh market data. */
  sync(summaries: Record<string, StateSummary>, opts: { quiet?: boolean; skip?: string } = {}) {
    let labelsDirty = false
    const first = !this.initialised
    this.initialised = true

    for (const s of STATES) {
      if (s.id === opts.skip) continue
      const summary = summaries[s.id]
      const to = territoryTarget(summary)
      const v = this.visuals[s.id]
      const prev = this.leaders[s.id]
      const leader = summary?.leader ?? null
      const next = leader ? { id: leader.id, symbol: leader.symbol, color: leader.color } : null
      const apply = () => this.write(s.id)

      if (first || opts.quiet) {
        Object.assign(v, to, { bleed: 0, tick: 1 })
        this.leaders[s.id] = next
        labelsDirty = true
        apply()
        continue
      }

      if (!prev && next) {
        this.leaders[s.id] = next
        labelsDirty = true
        territoryExpand(v, to, apply)
      } else if (prev && next && prev.id !== next.id) {
        territoryChange(v, to, apply, () => {
          this.leaders[s.id] = next
          this.pushLabels()
        })
      } else if (
        Math.abs(v.wash - to.wash) > 0.002 ||
        Math.abs(v.stipple - to.stipple) > 0.002 ||
        Math.abs(v.hatch - to.hatch) > 0.002
      ) {
        if (prev && next && prev.color !== next.color) {
          this.leaders[s.id] = next
          labelsDirty = true
        }
        territoryShift(v, to, apply)
      }
    }
    if (labelsDirty) this.pushLabels()
  }

  /** The celebratory first claim: plays even if the data already arrived. */
  claim(stateId: string, summary: StateSummary, delay = 0) {
    const leader = summary.leader
    this.leaders[stateId] = leader ? { id: leader.id, symbol: leader.symbol, color: leader.color } : null
    this.pushLabels()
    return territoryExpand(this.visuals[stateId], territoryTarget(summary), () => this.write(stateId), { delay })
  }

  /** Quiet a state's map labels while something else (the claim stamp) speaks for it. */
  mute(id: string, on: boolean) {
    const i = this.inter[id]
    if (!i) return
    gsap.to(i, { mute: on ? 1 : 0, duration: on ? 0.4 : 0.8, ease: 'power2.inOut', overwrite: 'auto', onUpdate: () => this.write(id) })
  }

  hover(id: string | null, prev: string | null) {
    if (prev && this.inter[prev]) hoverState(this.inter[prev], false, () => this.write(prev))
    if (id && this.inter[id]) hoverState(this.inter[id], true, () => this.write(id))
  }

  select(id: string | null) {
    for (const s of STATES) {
      const i = this.inter[s.id]
      const selected = s.id === id
      const target = { sel: selected ? 1 : 0, dim: id && !selected ? 1 : 0 }
      if (i.sel === target.sel && i.dim === target.dim) continue
      selectState(i, selected, !!id, () => this.write(s.id))
    }
  }
}

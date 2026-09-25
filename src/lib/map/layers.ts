import type { LayerSpecification, ExpressionSpecification } from 'maplibre-gl'
import { MAP } from './palette'

export const SRC_STATES = 'us-states'
export const SRC_LABELS = 'us-state-labels'

export const L = {
  base: 'state-base',
  grain: 'state-grain',
  wash: 'territory-wash',
  stipple: 'territory-stipple',
  hatch: 'territory-hatch',
  contour: 'territory-contour',
  hover: 'state-hover',
  dim: 'state-dim',
  border: 'state-border',
  selected: 'state-selected',
  names: 'state-names',
  tickers: 'territory-tickers',
} as const

const fs = (key: string, fallback: number): ExpressionSpecification => ['coalesce', ['feature-state', key], fallback]

const tokenRgb: ExpressionSpecification = ['rgb', fs('r', 41), fs('g', 59), fs('b', 74)]

/** The states themselves — fill, texture, hover, dimming, engraved borders. Split around the territory layers. */
export const stateBaseLayers: LayerSpecification[] = [
  {
    id: L.base,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-color': MAP.land, 'fill-opacity': 0.72 },
  },
  {
    id: L.grain,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-pattern': 'paper-grain', 'fill-opacity': 0.55 },
  },
]

export const territoryLayers: LayerSpecification[] = [
  {
    id: L.wash,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-color': tokenRgb, 'fill-opacity': fs('wash', 0), 'fill-antialias': false },
  },
  {
    id: L.hatch,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-pattern': 'hatch', 'fill-opacity': fs('hatch', 0) },
  },
  {
    id: L.stipple,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-pattern': 'stipple', 'fill-opacity': fs('stipple', 0) },
  },
  {
    // Ink that has bled into the paper along the border.
    id: L.contour,
    type: 'line',
    source: SRC_STATES,
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': tokenRgb,
      'line-opacity': fs('contour', 0),
      // `bleed` widens the line into the state: ink seeping in from the border.
      'line-width': ['interpolate', ['linear'], ['zoom'], 3, ['+', 3, ['*', 9, fs('bleed', 0)]], 7, ['+', 8, ['*', 26, fs('bleed', 0)]]],
      'line-blur': ['interpolate', ['linear'], ['zoom'], 3, ['+', 2.5, ['*', 8, fs('bleed', 0)]], 7, ['+', 7, ['*', 24, fs('bleed', 0)]]],
    },
  },
]

export const stateOverlayLayers: LayerSpecification[] = [
  {
    id: L.hover,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-color': MAP.hoverWash, 'fill-opacity': ['*', ['*', 0.3, fs('hover', 0)], ['-', 1, fs('sel', 0)]] },
  },
  {
    id: L.dim,
    type: 'fill',
    source: SRC_STATES,
    paint: { 'fill-color': MAP.dim, 'fill-opacity': ['*', 0.62, fs('dim', 0)] },
  },
  {
    id: L.border,
    type: 'line',
    source: SRC_STATES,
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': MAP.border,
      'line-opacity': ['+', 0.42, ['*', 0.4, fs('hover', 0)]],
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        3,
        ['+', 0.55, ['*', 0.5, fs('hover', 0)]],
        7,
        ['+', 1.1, ['*', 0.8, fs('hover', 0)]],
      ],
    },
  },
  {
    id: L.selected,
    type: 'line',
    source: SRC_STATES,
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': MAP.ink,
      'line-opacity': fs('sel', 0),
      'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.6, 7, 2.6],
    },
  },
]

export const labelLayers: LayerSpecification[] = [
  {
    id: L.names,
    type: 'symbol',
    source: SRC_LABELS,
    layout: {
      'text-field': [
        'step',
        ['zoom'],
        ['case', ['get', 'small'], ['get', 'id'], ['get', 'name']],
        5.4,
        ['get', 'name'],
      ],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 2, 6.5, 3, 8.5, 5, 11, 7, 14],
      'text-letter-spacing': ['interpolate', ['linear'], ['zoom'], 2, 0.12, 3.5, 0.28],
      'text-max-width': 7,
      'text-anchor': 'bottom',
      'text-offset': [0, -0.1],
      'text-padding': 1,
    },
    paint: {
      'text-color': MAP.label,
      'text-halo-color': 'rgba(233,223,203,0.75)',
      'text-halo-width': 1.2,
      'text-opacity': [
        '*',
        ['-', ['+', 0.56, ['*', 0.44, fs('hover', 0)]], ['*', 0.35, fs('dim', 0)]],
        ['-', 1, fs('mute', 0)],
      ],
    },
  },
  {
    id: L.tickers,
    type: 'symbol',
    source: SRC_LABELS,
    filter: ['!=', ['get', 'ticker'], ''],
    minzoom: 3.1,
    layout: {
      'text-field': ['get', 'ticker'],
      'text-font': ['Noto Sans Bold'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 5, 13, 7, 17],
      'text-letter-spacing': 0.06,
      'text-anchor': 'top',
      'text-offset': [0, 0.25],
      'text-padding': 1,
    },
    paint: {
      'text-color': ['get', 'color'],
      'text-halo-color': 'rgba(236,227,209,0.85)',
      'text-halo-width': 1.4,
      'text-opacity': ['*', ['*', fs('tick', 1), ['-', 1, ['*', 0.55, fs('dim', 0)]]], ['-', 1, fs('mute', 0)]],
    },
  },
]

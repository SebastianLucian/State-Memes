import type { StyleSpecification, LayerSpecification } from 'maplibre-gl'
import { MAP } from './palette'
import { SRC_LABELS, SRC_STATES, labelLayers, stateBaseLayers, stateOverlayLayers, territoryLayers } from './layers'
import { buildLabelPoints, getStateShapes } from './geometry'

const OFM = 'openmaptiles'

/**
 * An old road atlas built on OpenFreeMap / OpenMapTiles vector tiles.
 * The fifty states are our own GeoJSON layer on top, so the map still reads
 * as America even before (or without) basemap tiles.
 */
export function buildStyle(): StyleSpecification {
  const basemap: LayerSpecification[] = [
    { id: 'background', type: 'background', paint: { 'background-color': MAP.foreignLand } },
    {
      id: 'water',
      type: 'fill',
      source: OFM,
      'source-layer': 'water',
      filter: ['!=', ['get', 'brunnel'], 'tunnel'],
      paint: { 'fill-color': MAP.water, 'fill-outline-color': MAP.waterLine },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: OFM,
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: { 'fill-color': MAP.wood, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.1, 8, 0.2] },
    },
    {
      id: 'landcover-sand',
      type: 'fill',
      source: OFM,
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'sand'],
      paint: { 'fill-color': MAP.sand, 'fill-opacity': 0.3 },
    },
    {
      id: 'park',
      type: 'fill',
      source: OFM,
      'source-layer': 'park',
      paint: { 'fill-color': MAP.wood, 'fill-opacity': 0.08 },
    },
  ]

  const roads: LayerSpecification[] = [
    {
      id: 'waterway',
      type: 'line',
      source: OFM,
      'source-layer': 'waterway',
      filter: ['==', ['get', 'class'], 'river'],
      minzoom: 4,
      paint: { 'line-color': MAP.waterLine, 'line-opacity': 0.35, 'line-width': 0.6 },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: OFM,
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['trunk', 'primary']]],
      minzoom: 5.5,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': MAP.road,
        'line-opacity': 0.2,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5.5, 0.3, 10, 1],
      },
    },
    {
      id: 'roads-motorway',
      type: 'line',
      source: OFM,
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      minzoom: 3.5,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': MAP.road,
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 3.5, 0.18, 7, 0.4],
        'line-width': ['interpolate', ['linear'], ['zoom'], 3.5, 0.35, 8, 1.2],
        'line-dasharray': [6, 1.5],
      },
    },
  ]

  const worldLines: LayerSpecification[] = [
    {
      id: 'boundary-country',
      type: 'line',
      source: OFM,
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': MAP.ink,
        'line-opacity': 0.4,
        'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.8, 7, 1.4],
        'line-dasharray': [4, 1.5, 1, 1.5],
      },
    },
    {
      id: 'boundary-province',
      type: 'line',
      source: OFM,
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
      paint: { 'line-color': MAP.ink, 'line-opacity': 0.12, 'line-width': 0.5, 'line-dasharray': [3, 2] },
    },
  ]

  const places: LayerSpecification[] = [
    {
      id: 'water-names',
      type: 'symbol',
      source: OFM,
      'source-layer': 'water_name',
      filter: ['in', ['get', 'class'], ['literal', ['ocean', 'sea', 'bay', 'lake']]],
      layout: {
        'text-field': ['upcase', ['coalesce', ['get', 'name:en'], ['get', 'name']]],
        'text-font': ['Noto Sans Italic'],
        'text-size': ['match', ['get', 'class'], 'ocean', 13, 'sea', 11, 9.5],
        'text-letter-spacing': 0.45,
        'text-max-width': 8,
      },
      paint: { 'text-color': MAP.waterLabel, 'text-opacity': 0.7 },
    },
    {
      id: 'country-names',
      type: 'symbol',
      source: OFM,
      'source-layer': 'place',
      filter: ['all', ['==', ['get', 'class'], 'country'], ['!=', ['get', 'iso_a2'], 'US']],
      layout: {
        'text-field': ['upcase', ['coalesce', ['get', 'name:en'], ['get', 'name']]],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-letter-spacing': 0.6,
      },
      paint: { 'text-color': MAP.label, 'text-opacity': 0.4 },
    },
    {
      id: 'city-dots',
      type: 'circle',
      source: OFM,
      'source-layer': 'place',
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['coalesce', ['get', 'rank'], 99], 4]],
      minzoom: 4.3,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4.3, 1.3, 8, 2.4],
        'circle-color': MAP.ink,
        'circle-opacity': 0.55,
        'circle-stroke-color': MAP.land,
        'circle-stroke-width': 0.8,
      },
    },
    {
      id: 'city-names',
      type: 'symbol',
      source: OFM,
      'source-layer': 'place',
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['coalesce', ['get', 'rank'], 99], 4]],
      minzoom: 4.3,
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 4.3, 9, 8, 12],
        'text-anchor': 'left',
        'text-offset': [0.55, 0],
        'text-max-width': 8,
      },
      paint: {
        'text-color': MAP.label,
        'text-opacity': 0.55,
        'text-halo-color': 'rgba(233,223,203,0.7)',
        'text-halo-width': 1,
      },
    },
  ]

  return {
    version: 8,
    name: 'Frontier Atlas',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      [OFM]: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution:
          '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
      [SRC_STATES]: { type: 'geojson', data: getStateShapes(), promoteId: 'id' },
      [SRC_LABELS]: { type: 'geojson', data: buildLabelPoints({}), promoteId: 'id' },
    },
    layers: [
      ...basemap,
      ...stateBaseLayers,
      ...roads,
      ...territoryLayers,
      ...stateOverlayLayers,
      ...worldLines,
      ...places,
      ...labelLayers,
    ],
  }
}

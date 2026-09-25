/** Map colours: a faded road atlas. Restrained on purpose. */
export const MAP = {
  foreignLand: '#DCD1BA',
  land: '#E9DFCB',
  water: '#C3CAC0',
  waterLine: '#8E9A98',
  wood: '#A9A57F',
  sand: '#D6C39A',
  road: '#9C8566',
  border: '#171614',
  ink: '#171614',
  navy: '#293B4A',
  label: '#2A2622',
  waterLabel: '#566670',
  hoverWash: '#FFF9EC',
  dim: '#E6DBC5',
}

export function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Mix a colour toward ink — keeps light inks legible as text on the map. */
export function inkify(hex: string, amount = 0.4) {
  const { r, g, b } = hexToRgb(hex)
  const k = (c: number, ink: number) => Math.round(c + (ink - c) * amount)
  return `rgb(${k(r, 23)},${k(g, 22)},${k(b, 20)})`
}

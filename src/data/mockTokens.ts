import type { StateToken } from '../services/types'

/**
 * DEVELOPMENT MOCK DATA.
 * These tickers and market caps are invented to make the map feel inhabited
 * during development. They are not real tokens and not real market data.
 */
type Seed = [stateId: string, name: string, symbol: string, marketCap: number, color: string]

// Territory inks — pulled from the Americana palette and a few close relatives.
export const INKS = {
  navy: '#293B4A',
  brick: '#843F34',
  ochre: '#B28B4D',
  leather: '#674A34',
  slate: '#4A5A5E',
  sage: '#5E6B4E',
  rust: '#9A5A3A',
  ink: '#2A2622',
} as const

export const INK_LIST = Object.values(INKS)

const SEEDS: Seed[] = [
  ['TX', 'Lone Star', 'LONE', 4_820_291, INKS.navy],
  ['TX', 'Cattle Drive', 'COW', 1_212_400, INKS.brick],
  ['TX', 'Yeehaw Coin', 'YEE', 402_110, INKS.ochre],

  ['CA', 'Golden', 'GOLDEN', 5_204_880, INKS.ochre],
  ['CA', 'Pacific Coast', 'PCH', 2_118_020, INKS.navy],
  ['CA', 'Avocado', 'AVO', 1_050_300, INKS.sage],

  ['FL', 'Sunshine', 'SUN', 3_712_550, INKS.brick],
  ['FL', 'Gator', 'GATOR', 706_900, INKS.sage],

  ['NY', 'Empire', 'EMPIRE', 3_210_760, INKS.navy],
  ['NY', 'Bodega Cat', 'BODEGA', 1_904_100, INKS.leather],
  ['NY', 'Slice', 'SLICE', 612_000, INKS.brick],

  ['AZ', 'Desert Dust', 'DUST', 1_402_300, INKS.rust],
  ['AZ', 'Saguaro', 'CACTI', 380_200, INKS.sage],

  ['NV', 'The Strip', 'STRIP', 2_104_900, INKS.leather],
  ['NV', 'Area 51', 'ALIEN', 1_630_000, INKS.slate],

  ['OH', 'Buckeye', 'BUCK', 812_400, INKS.brick],
  ['OH', 'Cornfield', 'CORN', 760_100, INKS.ochre],

  ['CO', 'Fourteener', 'PEAK', 940_000, INKS.slate],
  ['WA', 'Evergreen', 'FIR', 1_120_000, INKS.sage],
  ['WA', 'Drizzle', 'RAIN', 330_000, INKS.slate],
  ['IL', 'Windy City', 'WIND', 1_480_000, INKS.navy],
  ['GA', 'Peach', 'PEACH', 870_300, INKS.rust],
  ['TN', 'Honky Tonk', 'TONK', 690_000, INKS.leather],
  ['LA', 'Bayou', 'BAYOU', 540_000, INKS.sage],
  ['MT', 'Big Sky', 'SKY', 260_000, INKS.navy],
  ['WY', 'Open Range', 'RANGE', 190_000, INKS.leather],
  ['MI', 'Motor', 'MOTOR', 760_000, INKS.ink],
  ['MA', 'Chowder', 'CHWDR', 520_000, INKS.navy],
  ['PA', 'Keystone', 'KEY', 610_000, INKS.ochre],
  ['NM', 'Enchanted', 'CHILE', 330_000, INKS.brick],
  ['AK', 'Last Frontier', 'NORTH', 450_000, INKS.slate],
  ['UT', 'Beehive', 'HIVE', 280_000, INKS.ochre],
  ['OR', 'Trail', 'TRAIL', 350_000, INKS.sage],
  ['NC', 'First Flight', 'FLIGHT', 400_000, INKS.navy],
  ['MN', 'Ten Thousand Lakes', 'LAKES', 300_000, INKS.slate],
  ['KS', 'Twister', 'TWSTR', 150_000, INKS.ochre],
  ['HI', 'Aloha', 'ALOHA', 610_000, INKS.rust],
]

export function buildMockTokens(): StateToken[] {
  return SEEDS.map(([stateId, name, symbol, marketCap, color], i) => ({
    id: `mock-${stateId}-${symbol}`.toLowerCase(),
    stateId,
    name,
    symbol,
    marketCap,
    color,
    createdAt: Date.UTC(2026, 0, 1) + i * 86_400_000,
    mock: true,
  }))
}

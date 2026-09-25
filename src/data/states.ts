/**
 * Static reference data for the fifty states.
 * `label` is a hand-placed [lon, lat] anchor — geometric centroids land in
 * the wrong place for states like Florida, Michigan or Louisiana.
 */
export type StateInfo = {
  id: string // postal code, used as the map feature id
  fips: string
  name: string
  nickname: string
  label: [number, number]
}

export const STATES: StateInfo[] = [
  { id: 'AL', fips: '01', name: 'Alabama', nickname: 'The Yellowhammer State', label: [-86.8, 32.8] },
  { id: 'AK', fips: '02', name: 'Alaska', nickname: 'The Last Frontier', label: [-152.3, 64.2] },
  { id: 'AZ', fips: '04', name: 'Arizona', nickname: 'The Grand Canyon State', label: [-111.7, 34.3] },
  { id: 'AR', fips: '05', name: 'Arkansas', nickname: 'The Natural State', label: [-92.4, 34.9] },
  { id: 'CA', fips: '06', name: 'California', nickname: 'The Golden State', label: [-119.6, 37.2] },
  { id: 'CO', fips: '08', name: 'Colorado', nickname: 'The Centennial State', label: [-105.5, 39.0] },
  { id: 'CT', fips: '09', name: 'Connecticut', nickname: 'The Constitution State', label: [-72.7, 41.6] },
  { id: 'DE', fips: '10', name: 'Delaware', nickname: 'The First State', label: [-75.5, 39.0] },
  { id: 'FL', fips: '12', name: 'Florida', nickname: 'The Sunshine State', label: [-81.6, 28.3] },
  { id: 'GA', fips: '13', name: 'Georgia', nickname: 'The Peach State', label: [-83.4, 32.7] },
  { id: 'HI', fips: '15', name: 'Hawaii', nickname: 'The Aloha State', label: [-156.3, 20.3] },
  { id: 'ID', fips: '16', name: 'Idaho', nickname: 'The Gem State', label: [-114.6, 44.1] },
  { id: 'IL', fips: '17', name: 'Illinois', nickname: 'The Prairie State', label: [-89.2, 40.0] },
  { id: 'IN', fips: '18', name: 'Indiana', nickname: 'The Hoosier State', label: [-86.3, 39.9] },
  { id: 'IA', fips: '19', name: 'Iowa', nickname: 'The Hawkeye State', label: [-93.5, 42.0] },
  { id: 'KS', fips: '20', name: 'Kansas', nickname: 'The Sunflower State', label: [-98.4, 38.5] },
  { id: 'KY', fips: '21', name: 'Kentucky', nickname: 'The Bluegrass State', label: [-85.3, 37.5] },
  { id: 'LA', fips: '22', name: 'Louisiana', nickname: 'The Pelican State', label: [-92.4, 31.0] },
  { id: 'ME', fips: '23', name: 'Maine', nickname: 'The Pine Tree State', label: [-69.2, 45.3] },
  { id: 'MD', fips: '24', name: 'Maryland', nickname: 'The Old Line State', label: [-76.8, 39.3] },
  { id: 'MA', fips: '25', name: 'Massachusetts', nickname: 'The Bay State', label: [-71.8, 42.35] },
  { id: 'MI', fips: '26', name: 'Michigan', nickname: 'The Great Lakes State', label: [-84.7, 43.6] },
  { id: 'MN', fips: '27', name: 'Minnesota', nickname: 'The North Star State', label: [-94.3, 46.3] },
  { id: 'MS', fips: '28', name: 'Mississippi', nickname: 'The Magnolia State', label: [-89.7, 32.7] },
  { id: 'MO', fips: '29', name: 'Missouri', nickname: 'The Show Me State', label: [-92.5, 38.4] },
  { id: 'MT', fips: '30', name: 'Montana', nickname: 'Big Sky Country', label: [-109.6, 47.0] },
  { id: 'NE', fips: '31', name: 'Nebraska', nickname: 'The Cornhusker State', label: [-99.8, 41.5] },
  { id: 'NV', fips: '32', name: 'Nevada', nickname: 'The Silver State', label: [-116.9, 39.3] },
  { id: 'NH', fips: '33', name: 'New Hampshire', nickname: 'The Granite State', label: [-71.6, 43.6] },
  { id: 'NJ', fips: '34', name: 'New Jersey', nickname: 'The Garden State', label: [-74.5, 40.1] },
  { id: 'NM', fips: '35', name: 'New Mexico', nickname: 'The Land of Enchantment', label: [-106.1, 34.4] },
  { id: 'NY', fips: '36', name: 'New York', nickname: 'The Empire State', label: [-75.5, 42.9] },
  { id: 'NC', fips: '37', name: 'North Carolina', nickname: 'The Tar Heel State', label: [-79.4, 35.5] },
  { id: 'ND', fips: '38', name: 'North Dakota', nickname: 'The Peace Garden State', label: [-100.5, 47.45] },
  { id: 'OH', fips: '39', name: 'Ohio', nickname: 'The Buckeye State', label: [-82.8, 40.3] },
  { id: 'OK', fips: '40', name: 'Oklahoma', nickname: 'The Sooner State', label: [-97.4, 35.5] },
  { id: 'OR', fips: '41', name: 'Oregon', nickname: 'The Beaver State', label: [-120.6, 43.9] },
  { id: 'PA', fips: '42', name: 'Pennsylvania', nickname: 'The Keystone State', label: [-77.7, 40.9] },
  { id: 'RI', fips: '44', name: 'Rhode Island', nickname: 'The Ocean State', label: [-71.5, 41.65] },
  { id: 'SC', fips: '45', name: 'South Carolina', nickname: 'The Palmetto State', label: [-80.9, 33.9] },
  { id: 'SD', fips: '46', name: 'South Dakota', nickname: 'Mount Rushmore State', label: [-100.2, 44.4] },
  { id: 'TN', fips: '47', name: 'Tennessee', nickname: 'The Volunteer State', label: [-86.3, 35.85] },
  { id: 'TX', fips: '48', name: 'Texas', nickname: 'The Lone Star State', label: [-99.3, 31.3] },
  { id: 'UT', fips: '49', name: 'Utah', nickname: 'The Beehive State', label: [-111.7, 39.3] },
  { id: 'VT', fips: '50', name: 'Vermont', nickname: 'The Green Mountain State', label: [-72.7, 44.05] },
  { id: 'VA', fips: '51', name: 'Virginia', nickname: 'The Old Dominion', label: [-78.8, 37.55] },
  { id: 'WA', fips: '53', name: 'Washington', nickname: 'The Evergreen State', label: [-120.4, 47.4] },
  { id: 'WV', fips: '54', name: 'West Virginia', nickname: 'The Mountain State', label: [-80.6, 38.65] },
  { id: 'WI', fips: '55', name: 'Wisconsin', nickname: 'The Badger State', label: [-89.9, 44.6] },
  { id: 'WY', fips: '56', name: 'Wyoming', nickname: 'The Equality State', label: [-107.5, 43.0] },
]

export const STATE_BY_ID: Record<string, StateInfo> = Object.fromEntries(STATES.map((s) => [s.id, s]))
export const STATE_BY_FIPS: Record<string, StateInfo> = Object.fromEntries(STATES.map((s) => [s.fips, s]))

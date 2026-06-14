export type LocationLevel = 'pin' | 'area' | 'locality'

export interface Location {
  id: string
  parent_id: string | null
  level: LocationLevel
  pin_code: string
  name: string
  slug: string
  created_at: string
}

export interface LocationDetail {
  location_id: string
  key: string
  value: string
  updated_by: string | null
  updated_at: string
}

export interface Post {
  id: string
  location_id: string
  parent_id: string | null
  path: string | null
  author_id: string
  display_name: string | null   // null = "Resident of [pin_code]"
  body: string
  created_at: string
}

// Predefined info field config — drives icons and labels in the UI
export interface InfoFieldConfig {
  key: string
  label: string
  icon: string
  levels: LocationLevel[]   // which location levels show this field
  category: 'mover' | 'civic' | 'community'
}

export const INFO_FIELDS: InfoFieldConfig[] = [
  // Mover fields — what portals hide, what we lead with
  { key: 'flooding',            label: 'Monsoon Flooding',    icon: '🌧',  levels: ['pin', 'area', 'locality'], category: 'mover' },
  { key: 'safety',              label: 'Safety After Dark',   icon: '🔦',  levels: ['pin', 'area', 'locality'], category: 'mover' },
  { key: 'water_supply',        label: 'Water Supply',        icon: '💧',  levels: ['area', 'locality'],        category: 'mover' },
  { key: 'power_reliability',   label: 'Power Reliability',   icon: '⚡',  levels: ['area', 'locality'],        category: 'mover' },
  { key: 'builder_reputation',  label: 'Builder / Society',   icon: '🏗',  levels: ['locality'],                category: 'mover' },
  // Administrative — seeded from India Post / LGD public data
  { key: 'district',            label: 'District',            icon: '🗺',  levels: ['pin', 'area'],             category: 'civic' },
  { key: 'state',               label: 'State',               icon: '📍',  levels: ['pin', 'area'],             category: 'civic' },
  { key: 'postal_division',     label: 'Postal Division',     icon: '🏤',  levels: ['pin'],                     category: 'civic' },
  // Civic contacts — seeded from LGD data
  { key: 'councillor_name',     label: 'Ward Councillor',     icon: '🏛',  levels: ['area'],                    category: 'civic' },
  { key: 'councillor_phone',    label: 'Councillor Phone',    icon: '📞',  levels: ['area'],                    category: 'civic' },
  { key: 'police_station',      label: 'Police Station',      icon: '🚔',  levels: ['pin', 'area'],             category: 'civic' },
  { key: 'hospital',            label: 'Nearest Hospital',    icon: '🏥',  levels: ['pin', 'area'],             category: 'civic' },
  { key: 'post_office',         label: 'Post Office',         icon: '📮',  levels: ['pin'],                     category: 'civic' },
  { key: 'rwa_name',            label: 'RWA / Association',   icon: '🏘',  levels: ['locality'],                category: 'community' },
  { key: 'rwa_contact',         label: 'RWA Contact',         icon: '📋',  levels: ['locality'],                category: 'community' },
]

export function getFieldsForLevel(level: LocationLevel): InfoFieldConfig[] {
  return INFO_FIELDS.filter(f => f.levels.includes(level))
}

// Human-readable section titles per category, in display order.
export const CATEGORY_LABELS: Record<InfoFieldConfig['category'], string> = {
  mover: 'Living here',
  civic: 'Civic & administrative',
  community: 'Community',
}

export interface FieldGroup {
  category: InfoFieldConfig['category']
  title: string
  fields: InfoFieldConfig[]
}

// Fields for a level, grouped by category (empty groups dropped). Drives the
// grouped info cards on each location page.
export function getGroupedFieldsForLevel(level: LocationLevel): FieldGroup[] {
  const order: InfoFieldConfig['category'][] = ['mover', 'civic', 'community']
  return order
    .map(category => ({
      category,
      title: CATEGORY_LABELS[category],
      fields: INFO_FIELDS.filter(f => f.category === category && f.levels.includes(level)),
    }))
    .filter(group => group.fields.length > 0)
}

export function getFieldConfig(key: string): InfoFieldConfig | undefined {
  return INFO_FIELDS.find(f => f.key === key)
}

// ─────────────────────────────────────────────────────────────────────────────
// Facilities / points of interest (places table)
// ─────────────────────────────────────────────────────────────────────────────

export type PlaceSource = 'osm' | 'community' | 'manual'

export interface Place {
  id: string
  location_id: string
  category: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  lat: number | null
  lng: number | null
  source: PlaceSource
  source_ref: string | null
  added_by: string | null
  created_at: string
}

export interface PlaceCategoryConfig {
  key: string
  label: string         // singular, e.g. "Hospital"
  plural: string        // e.g. "Hospitals"
  icon: string
  // OSM tag(s) this maps to during import — drives scripts/ingest-osm.ts later.
  osm?: string[]
}

export const PLACE_CATEGORIES: PlaceCategoryConfig[] = [
  { key: 'hospital',    label: 'Hospital',        plural: 'Hospitals',        icon: '🏥', osm: ['amenity=hospital', 'amenity=clinic'] },
  { key: 'pharmacy',    label: 'Pharmacy',        plural: 'Pharmacies',       icon: '💊', osm: ['amenity=pharmacy'] },
  { key: 'police',      label: 'Police Station',  plural: 'Police Stations',  icon: '🚔', osm: ['amenity=police'] },
  { key: 'fire',        label: 'Fire Station',    plural: 'Fire Stations',    icon: '🚒', osm: ['amenity=fire_station'] },
  { key: 'school',      label: 'School',          plural: 'Schools',          icon: '🏫', osm: ['amenity=school', 'amenity=college'] },
  { key: 'bank',        label: 'Bank',            plural: 'Banks',            icon: '🏦', osm: ['amenity=bank'] },
  { key: 'atm',         label: 'ATM',             plural: 'ATMs',             icon: '🏧', osm: ['amenity=atm'] },
  { key: 'post_office', label: 'Post Office',     plural: 'Post Offices',     icon: '📮', osm: ['amenity=post_office'] },
  { key: 'government',  label: 'Govt Office',     plural: 'Govt Offices',     icon: '🏛', osm: ['office=government', 'amenity=townhall'] },
  { key: 'park',        label: 'Park',            plural: 'Parks',            icon: '🌳', osm: ['leisure=park'] },
  { key: 'bus_stop',    label: 'Bus Stop',        plural: 'Bus Stops',        icon: '🚌', osm: ['highway=bus_stop'] },
  { key: 'metro',       label: 'Metro Station',   plural: 'Metro Stations',   icon: '🚇', osm: ['railway=station', 'station=subway'] },
  { key: 'water',       label: 'Water Point',     plural: 'Water Points',     icon: '🚰', osm: ['amenity=drinking_water'] },
  { key: 'other',       label: 'Other',           plural: 'Other',            icon: '📌' },
]

export function getPlaceCategory(key: string): PlaceCategoryConfig {
  return PLACE_CATEGORIES.find(c => c.key === key) ?? PLACE_CATEGORIES[PLACE_CATEGORIES.length - 1]
}

// ─────────────────────────────────────────────────────────────────────────────
// Numeric statistics (location_stats table)
// ─────────────────────────────────────────────────────────────────────────────

export interface LocationStat {
  location_id: string
  key: string
  value: number
  unit: string | null
  source: string
  as_of: string | null
}

export interface StatFieldConfig {
  key: string
  label: string
  icon: string
  suffix?: string   // e.g. "%"
}

export const STAT_FIELDS: StatFieldConfig[] = [
  { key: 'population',    label: 'Population',    icon: '👥' },
  { key: 'households',    label: 'Households',    icon: '🏠' },
  { key: 'literacy_rate', label: 'Literacy rate', icon: '📖', suffix: '%' },
  { key: 'sex_ratio',     label: 'Sex ratio',     icon: '⚖️' },
  { key: 'area_sqkm',     label: 'Area',          icon: '📐', suffix: ' sq km' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Community ratings (ratings table + location_rating_summary view)
// ─────────────────────────────────────────────────────────────────────────────

export interface RatingSummary {
  location_id: string
  dimension: string
  avg_score: number
  rating_count: number
}

export interface RatingDimensionConfig {
  key: string
  label: string
  icon: string
}

export const RATING_DIMENSIONS: RatingDimensionConfig[] = [
  { key: 'safety',       label: 'Safety',             icon: '🔦' },
  { key: 'water_supply', label: 'Water supply',       icon: '💧' },
  { key: 'power',        label: 'Power reliability',  icon: '⚡' },
  { key: 'cleanliness',  label: 'Cleanliness',        icon: '🧹' },
  { key: 'connectivity', label: 'Connectivity',       icon: '🛣️' },
  { key: 'greenery',     label: 'Greenery',           icon: '🌳' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Civic issue / complaint tracker (issues table — see docs/complaint-system.md)
// ─────────────────────────────────────────────────────────────────────────────

export type IssueStatus = 'reported' | 'verified' | 'in_progress' | 'resolved'

export interface Issue {
  id: string
  location_id: string
  pin_code: string
  author_id: string | null
  title: string
  description: string | null
  category: string
  status: IssueStatus
  location_text: string | null
  photo_urls: string[]
  confirmation_score: number
  created_at: string
  resolved_at: string | null
  // Attached in the app from issue_action_summary:
  affected_count?: number
  confirm_count?: number
}

export interface IssueCategoryConfig {
  key: string
  label: string
  icon: string
}

export const ISSUE_CATEGORIES: IssueCategoryConfig[] = [
  { key: 'road',        label: 'Road',        icon: '🛣️' },
  { key: 'water',       label: 'Water',       icon: '💧' },
  { key: 'electricity', label: 'Electricity', icon: '⚡' },
  { key: 'sanitation',  label: 'Sanitation',  icon: '🗑️' },
  { key: 'safety',      label: 'Safety',      icon: '🔦' },
  { key: 'other',       label: 'Other',       icon: '📌' },
]

export function getIssueCategory(key: string): IssueCategoryConfig {
  return ISSUE_CATEGORIES.find((c) => c.key === key) ?? ISSUE_CATEGORIES[ISSUE_CATEGORIES.length - 1]
}

export interface IssueStatusConfig {
  key: IssueStatus
  label: string
  tone: string // tailwind badge classes
}

// "Community Resolved" — resolution is always attributed to the community,
// never to an authority (legal + positioning, per the design doc).
export const ISSUE_STATUSES: IssueStatusConfig[] = [
  { key: 'reported',    label: 'Reported',           tone: 'bg-ink/5 text-ink/55' },
  { key: 'verified',    label: 'Verified',           tone: 'bg-brand-blue/10 text-brand-blue' },
  { key: 'in_progress', label: 'In Progress',        tone: 'bg-amber-100 text-amber-700' },
  { key: 'resolved',    label: 'Community Resolved',  tone: 'bg-brand-green/10 text-brand-green' },
]

export function getIssueStatus(key: string): IssueStatusConfig {
  return ISSUE_STATUSES.find((s) => s.key === key) ?? ISSUE_STATUSES[0]
}

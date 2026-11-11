import type { PriceCalculator, PriceService } from '@/payload-types'

import { POSTCODE_COORDINATES } from './postcodes'

/**
 * Prisberegnerens regnestykke, samlet her så blokken og evt. tests bruger det samme:
 * akutgebyr (kun akutte ydelser, én gang) + tid × timepris + materialer + tilvalg, derefter tidstillæg, kørsel og til sidst moms.
 * Tomme beløb tæller som 0.
 */

export type CustomerType = 'business' | 'private'
export type Period = 'day' | 'eveningNight' | 'weekendHoliday'

export type Selection = { optionIds: string[]; quantity: number; serviceId: string }

/**
 * En linje i prisboksen. Alle linjer står på samme niveau.
 * amount null: linjen har ingen pris, men en tekst (fx "Antal", "2 stk.") eller er en ydelse uden produktpris.
 */
type PriceLine = { amount: number | null; label: string; text?: string }

export type PriceResult = {
  driving: Driving | null
  /** Kørsel alene (med moms for private), så den kan vises, så snart postnummeret er skrevet. */
  drivingAmount: number | null
  /** Kørsel er sat op, men ikke regnet med (intet postnummer, ukendt postnummer eller uden for området). */
  drivingUnknown: boolean
  /** Ydelser, der købes i butikken: ingen pris, kun en tekst. */
  inStore: { label: string; text: string | null }[]
  high: number
  includesVat: boolean
  lines: PriceLine[]
  low: number
  total: number
}

export const CUSTOMER_TYPES: { label: string; value: CustomerType }[] = [
  { label: 'Privat', value: 'private' },
  { label: 'Erhverv', value: 'business' },
]

export const PERIODS: { hint: string; label: string; value: Period }[] = [
  { label: 'Hverdag i dagtimerne', hint: 'Mandag til fredag inden for åbningstid', value: 'day' },
  { label: 'Aften og nat', hint: 'Døgnvagt fra kl. 16 til 08', value: 'eveningNight' },
  { label: 'Weekend og helligdag', hint: 'Lørdag, søndag og helligdage', value: 'weekendHoliday' },
]

export function formatKr(amount: number): string {
  return `${new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(amount)} kr.`
}

/**
 * Kørsel for et postnummer:
 * - "price": et beløb, fra en undtagelse eller afstand × pris pr. km
 * - "outside": kendt postnummer, men uden pris (undtagelse uden beløb eller længere væk end maks. km)
 * - "unknown": postnummeret findes ikke i listen
 * null, når der ikke er skrevet et helt postnummer, eller når kørsel ikke er sat op.
 */
export type Driving =
  | { amount: number; department: string; distanceKm: number | null; exception: string | null; status: 'price' }
  | { department: string | null; distanceKm: number | null; status: 'outside' }
  | { status: 'unknown' }

export function hasDriving(settings: PriceCalculator): boolean {
  return Boolean(settings.departments?.length && settings.pricePerKm != null)
}

// Afstand i luftlinje (haversine) i km.
function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const rad = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * rad) / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

function findDriving(settings: PriceCalculator, postcode: string): Driving | null {
  if (!hasDriving(settings) || !/^\d{4}$/.test(postcode)) return null
  const point = POSTCODE_COORDINATES[postcode]
  if (!point) return { status: 'unknown' }

  const nearest = (settings.departments ?? [])
    .flatMap((department) => {
      const location = POSTCODE_COORDINATES[department.postcode.trim()]
      return location ? [{ name: department.name, km: distanceKm(point, location) }] : []
    })
    .sort((a, b) => a.km - b.km)[0]
  const department = nearest?.name ?? null
  const km = nearest ? Math.round(nearest.km) : null

  const exception = (settings.exceptions ?? []).find((item) => item.postcode.trim() === postcode)
  if (exception) {
    return exception.surcharge == null
      ? { status: 'outside', department, distanceKm: km }
      : { status: 'price', amount: exception.surcharge, department: department ?? '', distanceKm: km, exception: exception.name || postcode }
  }

  if (!nearest || (settings.maxKm != null && nearest.km > settings.maxKm)) return { status: 'outside', department, distanceKm: km }
  return { status: 'price', amount: nearest.km * n(settings.pricePerKm), department: nearest.name, distanceKm: km, exception: null }
}

const n = (value: number | null | undefined) => value ?? 0

// Hele kroner, så linjerne og summen passer sammen.
const round = (value: number) => Math.round(value)

/** Minutter som "30 min", "1 t" eller "1 t 30 min". */
function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return [hours ? `${hours} t` : '', rest || !hours ? `${rest} min` : ''].filter(Boolean).join(' ')
}

export function calculatePrice({
  customerType,
  period,
  postcode,
  selections,
  services,
  settings,
}: {
  customerType: CustomerType
  period: Period
  postcode: string
  selections: Selection[]
  services: PriceService[]
  settings: PriceCalculator
}): PriceResult {
  const includesVat = customerType === 'private'
  const vat = includesVat ? 1 + n(settings.vatPercent) / 100 : 1
  const hourly = n(settings.hourlyRate)

  // amount er ekskl. moms her. keep: vises også ved 0 kr. (ydelsens navn, så antal og tilvalg har noget at stå under).
  const lines: (PriceLine & { exact?: boolean; keep?: boolean })[] = []
  const inStore: PriceResult['inStore'] = []
  // Ydelser med prisinterval (med moms for private), hver med sin laveste og højeste pris.
  const ranges: { from: number; to: number }[] = []
  let emergencyFee = false
  // Al arbejdstid på tværs af ydelserne samles i én linje.
  let minutes = 0

  for (const selection of selections) {
    const service = services.find((s) => s.id === selection.serviceId)
    if (!service) continue

    if (service.pricingModel === 'inStore') {
      inStore.push({ label: service.name, text: service.storeText ?? null })
      continue
    }
    if (service.pricingModel === 'priceRange') {
      // En linje med intervallet som tekst. Intervallet lægges til både den lave og den høje sum nedenfor.
      const from = round(n(service.fromPrice) * vat)
      const to = round(n(service.toPrice) * vat)
      ranges.push({ from, to })
      lines.push({ label: service.name, amount: null, text: `${formatKr(from)} til ${formatKr(to)}`, keep: true })
      continue
    }

    const quantity = selection.quantity
    const chosen = (service.options ?? []).filter((option) => option.id && selection.optionIds.includes(option.id))

    // Ydelsens linje viser produktprisen for alle styk. Ydelser med højst 1 stk. (fx døråbning) vises uden antal.
    const single = (service.maxQuantity ?? 99) <= (service.minQuantity ?? 1)
    lines.push(
      { label: service.name, amount: n(service.unitPrice) * quantity, keep: true },
      ...(single ? [] : [{ label: 'Antal', amount: null, text: `${quantity} stk.` }]),
      ...chosen.map((option) => ({ label: option.name, amount: n(option.price) * (option.perUnit ? quantity : 1) })),
    )
    minutes += n(service.minutesPerUnit) * quantity
    // Akutgebyret hører til akutte ydelser og lægges på én gang.
    if (service.category === 'emergency') emergencyFee = true
  }

  if (lines.length && minutes) lines.push({ label: `Arbejdstid (${formatMinutes(minutes)})`, amount: (minutes / 60) * hourly })
  // Feltet hedder stadig callOutFee i databasen, men vises i admin som "Emergency fee".
  if (lines.length && emergencyFee && settings.callOutFee) lines.unshift({ label: 'Akutgebyr', amount: settings.callOutFee })

  const work = lines.reduce((sum, line) => sum + n(line.amount), 0)
  if (lines.length && period !== 'day') {
    const surcharge = settings[period]
    const amount = surcharge?.type === 'percent' ? (work * n(surcharge.value)) / 100 : n(surcharge?.value)
    if (amount) lines.push({ label: PERIODS.find((p) => p.value === period)!.label, amount })
  }

  const driving = findDriving(settings, postcode)
  // Kørsel er få kroner ved korte afstande, så den rundes til hele kroner i stedet for tiere (ellers bliver den 0 og forsvinder).
  if (lines.length && driving?.status === 'price' && driving.amount) lines.unshift({ label: 'Kørsel', amount: driving.amount, exact: true })

  // Linjer, der rundes ned til 0 kr. (fx få km kørsel), vises ikke.
  const shown: PriceLine[] = lines
    .map(({ amount, label, text, exact, keep }) => ({
      label,
      text,
      keep,
      amount: amount == null ? null : exact ? Math.round(amount * vat) : round(amount * vat),
    }))
    .filter((line) => line.keep || line.amount !== 0)
    // En ydelse uden produktpris eller med prisinterval står uden beløb.
    .map(({ keep: _keep, amount, ...line }) => ({ ...line, amount: amount || null }))
  // Totalen af de regnede linjer. Procent-intervallet fra globalen lægges kun på dem; ydelsernes egne intervaller lægges til bagefter.
  const calculated = shown.reduce((sum, line) => sum + n(line.amount), 0)
  const range = n(settings.priceRangePercent) / 100
  const rangeFrom = ranges.reduce((sum, item) => sum + item.from, 0)
  const rangeTo = ranges.reduce((sum, item) => sum + item.to, 0)
  const total = calculated + rangeFrom

  return {
    driving,
    drivingAmount: driving?.status === 'price' ? Math.round(driving.amount * vat) : null,
    drivingUnknown: Boolean(lines.length && hasDriving(settings) && driving?.status !== 'price'),
    inStore,
    high: round(calculated * (1 + range)) + rangeTo,
    includesVat,
    lines: shown,
    low: Math.max(0, round(calculated * (1 - range))) + rangeFrom,
    total,
  }
}

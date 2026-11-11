import { DENMARK_PATH, MAP_HEIGHT, MAP_WIDTH, projectToMap } from '@/lib/denmarkMap'
import { POSTCODE_COORDINATES } from '@/lib/postcodes'
import type { PriceCalculator } from '@/payload-types'

/**
 * Lille kort over Danmark med afdelingerne. Den nærmeste afdeling lyser op, og når postnummeret er kendt,
 * kommer en prik for kunden og en stiplet linje (luftlinje, som kørslen regnes af) til afdelingen.
 * Kortet har fast størrelse, så trinnet ikke hopper, når postnummeret skrives.
 */
export function DenmarkMap({
  departments,
  nearest,
  postcode,
}: {
  departments: PriceCalculator['departments']
  /** Navnet på den nærmeste afdeling, når postnummeret er kendt. */
  nearest: string | null
  postcode: string
}) {
  const marks = (departments ?? []).flatMap((department) => {
    const coordinates = POSTCODE_COORDINATES[department.postcode.trim()]
    const point = coordinates && projectToMap(coordinates)
    return point ? [{ name: department.name, point }] : []
  })
  const coordinates = /^\d{4}$/.test(postcode) ? POSTCODE_COORDINATES[postcode] : undefined
  const customer = coordinates ? projectToMap(coordinates) : null
  const target = marks.find((mark) => mark.name === nearest)?.point
  const showCustomer = Boolean(customer && target)

  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden className="block h-auto w-full overflow-visible">
      <path d={DENMARK_PATH} className="fill-[#e4e8ef]" />

      <g className={`transition-opacity duration-300 ${showCustomer ? 'opacity-100' : 'opacity-0'}`}>
        <line
          x1={customer?.[0] ?? 0}
          y1={customer?.[1] ?? 0}
          x2={target?.[0] ?? 0}
          y2={target?.[1] ?? 0}
          className="stroke-brand-500"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      </g>

      {marks.map((mark) => {
        const active = mark.name === nearest
        return (
          <g key={mark.name} className="transition-colors duration-300">
            {active && <circle cx={mark.point[0]} cy={mark.point[1]} r="20" className="fill-brand-500/15" />}
            <circle cx={mark.point[0]} cy={mark.point[1]} r={active ? 10 : 8} className={active ? 'fill-brand-500' : 'fill-ink-800'} />
            <text
              x={mark.point[0]}
              y={mark.point[1] - (active ? 20 : 16)}
              fontSize="24"
              textAnchor="middle"
              className={active ? 'fill-brand-500 font-semibold' : 'fill-ink-800'}
            >
              {mark.name}
            </text>
          </g>
        )
      })}

      <g className={`transition-opacity duration-300 ${showCustomer ? 'opacity-100' : 'opacity-0'}`}>
        <circle cx={customer?.[0] ?? 0} cy={customer?.[1] ?? 0} r="9" className="fill-white stroke-ink-800" strokeWidth="4" />
      </g>
    </svg>
  )
}

'use client'

import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'

import { DynamicForm } from '@/components/forms/DynamicForm'
import {
  calculatePrice,
  CUSTOMER_TYPES,
  type CustomerType,
  formatKr,
  hasDriving,
  type Period,
  PERIODS,
  type Selection,
  unitLabel,
} from '@/lib/priceCalculator'
import { ROUTES } from '@/lib/routes'
import type { Form, PriceCalculator, PriceService } from '@/payload-types'

type Category = PriceService['category']

const CATEGORIES: { hint: string; label: string; value: Category }[] = [
  { label: 'Akut hjælp', hint: 'Låst ude eller brug for hjælp nu', value: 'emergency' },
  { label: 'Mekanisk sikring', hint: 'Låse, cylindre og nøgler', value: 'mechanical' },
  { label: 'Elektronisk sikring', hint: 'Adgangskontrol, dørtelefoni og video', value: 'electronic' },
]

const CARD = 'rounded-2xl border border-[#e4e8ef] bg-white p-(--fluid-form-pad) shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
const STEP_HEADING = 'flex items-center gap-3 font-heading text-xl leading-[26px] font-light text-ink-800'
const CHOICE =
  'flex cursor-pointer flex-col gap-1 rounded-lg border border-[#ced5e1] bg-[#f9fafb] px-4 py-3 text-sm text-ink-800 transition-colors hover:border-ink-muted has-checked:border-brand-500 has-checked:bg-white has-checked:shadow-[inset_0_0_0_1px_var(--color-brand-500)] has-focus-visible:outline-2 has-focus-visible:outline-brand-500'

function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-sans text-sm font-medium text-white">
      {children}
    </span>
  )
}

type Chosen = Record<string, { optionIds: string[]; quantity: number }>

/** Prisberegnerens trin og den løbende pris. Selve regnestykket står i lib/priceCalculator.ts. */
export function PriceCalculatorClient({
  categories,
  form,
  phone,
  services,
  settings,
}: {
  /** Kategorierne, blokken viser. */
  categories: Category[]
  form: Form | null
  /** Til "Akut hjælp", som ikke regner en pris, men viser telefonnummeret. */
  phone: null | string
  services: PriceService[]
  settings: PriceCalculator
}) {
  const [customerType, setCustomerType] = useState<CustomerType>('private')
  const [category, setCategory] = useState<Category | null>(null)
  const [chosen, setChosen] = useState<Chosen>({})
  const [period, setPeriod] = useState<Period>('day')
  const [postcode, setPostcode] = useState('')
  const [showForm, setShowForm] = useState(false)
  // Under 992px ligger prisboksen nederst, så en bjælke viser prisen, indtil boksen selv er i billedet.
  const summaryRef = useRef<HTMLElement>(null)
  const [summaryInView, setSummaryInView] = useState(false)

  useEffect(() => {
    // Også skjult, når man er scrollet forbi boksen (fx ned i footeren). En scroll-lytter i stedet for IntersectionObserver,
    // som ikke melder noget, når man springer helt forbi boksen i ét hop (fx "til toppen" på iPhone).
    const update = () => {
      const element = summaryRef.current
      if (element) setSummaryInView(element.getBoundingClientRect().top < window.innerHeight)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const drivingEnabled = hasDriving(settings)
  const visible = services.filter((service) => !service.customerTypes?.length || service.customerTypes.includes(customerType))
  const selections: Selection[] = visible
    .filter((service) => chosen[service.id])
    .map((service) => {
      const choice = chosen[service.id]
      // Et tilvalg, der er skjult ved det valgte antal ("Show from quantity"), regnes ikke med.
      const optionIds = choice.optionIds.filter((id) => {
        const option = service.options?.find((item) => item.id === id)
        return option && choice.quantity >= (option.showFromQuantity ?? 1)
      })
      return { serviceId: service.id, quantity: choice.quantity, optionIds }
    })
  // Ingen regnet pris (kun fra-pris eller køb i butikken), så tidspunktet er ligegyldigt.
  const needsVisit =
    selections.length > 0 &&
    selections.every((s) => ['fromPrice', 'inStore'].includes(visible.find((v) => v.id === s.serviceId)?.pricingModel ?? ''))

  const result = calculatePrice({ customerType, period, postcode, selections, services: visible, settings })
  // Kun butiksvarer valgt: intet tilbud at sende, og disclaimeren om montøren passer ikke.
  const needsQuote = result.lines.length > 0 || result.fromPrices.length > 0
  const onlyStore = !needsQuote && result.inStore.length > 0
  const storeTexts = [...new Set(result.inStore.flatMap((item) => (item.text ? [item.text] : [])))]
  const driving = result.driving
  // Kørsel er en del af prisen, så summen vises først, når postnummeret er skrevet.
  const postcodeDone = !drivingEnabled || /^[0-9]{4}$/.test(postcode)
  const awaitingPostcode = drivingEnabled && result.lines.length > 0 && driving === null
  const outsideText = settings.outsideAreaText || 'Kørsel aftales, når vi kontakter dig.'
  const drivingNote =
    driving?.status === 'outside' ? outsideText : driving?.status === 'unknown' ? 'Vi kan ikke finde postnummeret. Tjek, at det er skrevet rigtigt.' : null
  const vatLabel = result.includesVat ? 'inkl. moms' : 'ekskl. moms'
  const lowestFrom = Math.min(...result.fromPrices.flatMap((item) => (item.amount == null ? [] : [item.amount])))
  const barPrice = awaitingPostcode
    ? 'Indtast postnummer'
    : result.lines.length
    ? result.low === result.high
      ? formatKr(result.total)
      : `${formatKr(result.low)} til ${formatKr(result.high)}`
    : Number.isFinite(lowestFrom)
      ? `Fra ${formatKr(lowestFrom)}`
      : result.fromPrices.length
        ? 'Efter besigtigelse'
        : 'Køb i butikken'

  // En kategori vises, hvis der er ydelser i den; akut også med blot et telefonnummer.
  const categoryChoices = CATEGORIES.filter(
    (item) =>
      categories.includes(item.value) &&
      (visible.some((service) => service.category === item.value) || (item.value === 'emergency' && Boolean(phone))),
  )
  // Kun akut har tidstillæg (aften, nat og weekend). Planlagte opgaver regnes til almindelig tid.
  const emergency = category === 'emergency'

  // Mekanisk og elektronisk kan vælges sammen, så valget bevares, når man skifter mellem dem. Akut har tidstillæg og
  // regnes for sig, så skift til og fra akut starter valget forfra.
  const chooseCategory = (value: Category) => {
    if (category === 'emergency' || value === 'emergency') {
      setChosen({})
      setPeriod('day')
    }
    setCategory(value)
    setShowForm(false)
  }

  const toggle = (service: PriceService) =>
    setChosen((current) => {
      const next = { ...current }
      if (next[service.id]) delete next[service.id]
      else next[service.id] = { quantity: service.minQuantity ?? 1, optionIds: [] }
      return next
    })

  const setQuantity = (service: PriceService, quantity: number) => {
    const min = service.minQuantity ?? 1
    const max = service.maxQuantity ?? 99
    setChosen((current) => ({ ...current, [service.id]: { ...current[service.id], quantity: Math.min(max, Math.max(min, quantity)) } }))
  }

  const toggleOption = (service: PriceService, optionId: string) =>
    setChosen((current) => {
      const serviceId = service.id
      const ids = current[serviceId].optionIds
      // Et påkrævet valg er et enten/eller: det valgte tilvalg erstatter det forrige.
      if (service.chooseOneOption) return { ...current, [serviceId]: { ...current[serviceId], optionIds: [optionId] } }
      return {
        ...current,
        [serviceId]: { ...current[serviceId], optionIds: ids.includes(optionId) ? ids.filter((id) => id !== optionId) : [...ids, optionId] },
      }
    })

  // Det, der sendes med formularen, så montøren kan se hvad kunden har valgt og fået vist.
  const summary = [
    `Kundetype: ${CUSTOMER_TYPES.find((t) => t.value === customerType)?.label}`,
    // Som i prisboksen: en linje pr. ydelse med totalen, og produkt, arbejdstid og tilvalg indrykket under.
    ...result.lines.flatMap((line, index) => {
      if (!line.group) return [`${line.label}: ${formatKr(line.amount)}`]
      const first = line.group !== result.lines[index - 1]?.group
      const total = result.lines.filter((item) => item.group === line.group).reduce((sum, item) => sum + item.amount, 0)
      return [...(first ? [`${line.group}: ${formatKr(total)}`] : []), `  ${line.label}: ${formatKr(line.amount)}`]
    }),
    ...result.fromPrices.map((item) => `${item.label}: ${item.amount == null ? 'pris efter besigtigelse' : `fra ${formatKr(item.amount)}`}`),
    ...result.inStore.map((item) => `${item.label}: køb i butikken`),
    emergency ? `Tidspunkt: ${PERIODS.find((p) => p.value === period)?.label}` : '',
    postcode
      ? `Postnummer: ${postcode}${
          driving?.status === 'unknown'
            ? ' (ukendt postnummer)'
            : driving && driving.distanceKm != null
              ? ` (ca. ${driving.distanceKm} km fra ${driving.department}${driving.status === 'outside' ? ', kørsel aftales' : ''}${driving.status === 'price' && driving.exception ? `, fast pris: ${driving.exception}` : ''})`
              : ''
        }`
      : '',
    result.lines.length
      ? `Vejledende pris: ${result.low === result.high ? formatKr(result.total) : `${formatKr(result.low)} til ${formatKr(result.high)}`} ${vatLabel}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  let step = 1

  return (
    <div className="mt-(--fluid-gap-md) grid items-start gap-6 min-[992px]:grid-cols-[minmax(0,1fr)_380px] min-[992px]:gap-8">
      <div className="flex flex-col gap-6">
        <fieldset className={CARD}>
          <legend className="contents">
            <span className={STEP_HEADING}>
              <StepNumber>{step++}</StepNumber>
              Hvem skal have hjælp?
            </span>
          </legend>
          <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            {CUSTOMER_TYPES.map((type) => (
              <label key={type.value} className={`${CHOICE} justify-center text-center`}>
                <input
                  type="radio"
                  name="customerType"
                  value={type.value}
                  checked={customerType === type.value}
                  onChange={() => setCustomerType(type.value)}
                  className="sr-only"
                />
                <span className="font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Altid vist, også ved ydelser med fra-pris: postnummeret er nyttigt for tilbuddet, og trinnumrene skal ikke skifte undervejs. */}
        {drivingEnabled && (
          <div className={CARD}>
            <label htmlFor="price-postcode" className={STEP_HEADING}>
              <StepNumber>{step++}</StepNumber>
              Hvor skal vi komme ud?
            </label>
            <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-4">
              <input
                id="price-postcode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={4}
                placeholder="Postnummer"
                value={postcode}
                onChange={(event) => setPostcode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                className="h-10 w-full rounded-md border border-[#ced5e1] bg-[#f9fafb] px-3 text-sm text-ink-800 outline-none placeholder:text-text-body/60 hover:border-ink-muted focus:border-brand-500 min-[480px]:w-40"
                suppressHydrationWarning
              />
              <p aria-live="polite" className="text-sm text-text-body">
                {driving?.status === 'price' && driving.department && `Vi kører fra vores afdeling i ${driving.department}.`}                {drivingNote}
              </p>
            </div>
            {/* Krævet af licensen (CC BY 4.0) for postnummerdata, se lib/postcodes.ts. */}
            <p className="mt-3 text-[11px] leading-4 text-text-body/70">
              Kørselsafstand beregnet med postnummerdata fra{' '}
              <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-800">
                GeoNames
              </a>
              .
            </p>
          </div>
        )}

        {/* Flowet: ydelserne står der hele tiden, men er låst og nedtonet, til postnummeret er skrevet (så kørslen altid er med i prisen). */}
        <div className={`flex flex-col gap-6 ${postcodeDone ? '' : 'pointer-events-none opacity-50 select-none'}`} inert={!postcodeDone}>
        <div className={CARD}>
          <h2 className={STEP_HEADING}>
            <StepNumber>{step++}</StepNumber>
            Hvad skal laves?
          </h2>
          <div role="radiogroup" aria-label="Kategori" className="mt-5 grid grid-cols-1 gap-3 min-[768px]:grid-cols-3">
            {categoryChoices.map((item) => (
              <label key={item.value} className={CHOICE}>
                <input
                  type="radio"
                  name="category"
                  value={item.value}
                  checked={category === item.value}
                  onChange={() => chooseCategory(item.value)}
                  className="sr-only"
                />
                <span className="font-medium">{item.label}</span>
                <span className="text-xs leading-[18px] text-text-body">{item.hint}</span>
              </label>
            ))}
          </div>

          {/* Den, der står låst ude, vil måske hellere ringe end regne. Knappen står i prisboksen. */}
          {emergency && phone && (
            <p className="mt-6 border-t border-[#e4e8ef] pt-6 text-sm leading-[21px] text-ink-800">
              <span className="font-medium">Står du låst ude?</span> Ring til os på{' '}
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="whitespace-nowrap underline hover:text-brand-500">
                {phone}
              </a>
              , vi har døgnvagt. Eller få et vejledende prisoverslag her.
            </p>
          )}

          {CATEGORIES.filter((group) => group.value === category).map((group) => {
            const items = visible.filter((service) => service.category === group.value)
            return (
              <fieldset key={group.value} className={`mt-6 ${emergency ? '' : 'border-t border-[#e4e8ef] pt-6'}`}>
                <legend className="sr-only">{group.label}</legend>
                <ul className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2">
                  {items.map((service) => {
                    const selected = chosen[service.id]
                    // Med højst 1 stk. er der intet at vælge, så antalsvælgeren skjules.
                    const perUnit = service.pricingModel === 'perUnit' && (service.maxQuantity ?? 99) > (service.minQuantity ?? 1)
                    return (
                      <li key={service.id} className={`${CHOICE} gap-0 p-0`}>
                        <label className="flex cursor-pointer items-start gap-3 px-4 py-3">
                          <input type="checkbox" checked={Boolean(selected)} onChange={() => toggle(service)} className="peer sr-only" />
                          <span
                            aria-hidden
                            className="mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border border-[rgba(34,41,59,0.25)] text-transparent peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white"
                          >
                            <svg viewBox="0 0 12 9" fill="none" className="h-2 w-[11px]">
                              <path d="M1 4.5 4.2 7.5 11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span className="flex flex-col gap-1">
                            <span className="font-medium">{service.name}</span>
                            {service.description && <span className="text-xs leading-[18px] text-text-body">{service.description}</span>}
                            {service.pricingModel === 'inStore' && (
                              <span className="text-xs leading-[18px] font-medium text-brand-500">Køb i butikken</span>
                            )}
                          </span>
                        </label>

                        {selected && (perUnit || service.options?.length) ? (
                          <div className="flex flex-col gap-3 border-t border-[#e4e8ef] px-4 py-3">
                            {perUnit && (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-text-body">Antal {unitLabel(service.unit, 2)}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    aria-label="Færre"
                                    onClick={() => setQuantity(service, selected.quantity - 1)}
                                    disabled={selected.quantity <= (service.minQuantity ?? 1)}
                                    className="h-8 w-8 rounded-md border border-[#ced5e1] bg-white text-ink-800 hover:border-brand-500 disabled:opacity-40"
                                  >
                                    −
                                  </button>
                                  <output aria-live="polite" className="w-8 text-center font-medium">
                                    {selected.quantity}
                                  </output>
                                  <button
                                    type="button"
                                    aria-label="Flere"
                                    onClick={() => setQuantity(service, selected.quantity + 1)}
                                    disabled={selected.quantity >= (service.maxQuantity ?? 99)}
                                    className="h-8 w-8 rounded-md border border-[#ced5e1] bg-white text-ink-800 hover:border-brand-500 disabled:opacity-40"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                            {(service.options ?? []).map((option) =>
                              option.id && selected.quantity >= (option.showFromQuantity ?? 1) ? (
                                <label key={option.id} className="flex cursor-pointer items-center gap-2 text-xs text-ink-800">
                                  <input
                                    type={service.chooseOneOption ? 'radio' : 'checkbox'}
                                    name={`option-${service.id}`}
                                    checked={selected.optionIds.includes(option.id)}
                                    onChange={() => toggleOption(service, option.id!)}
                                    className="h-4 w-4 accent-brand-500"
                                  />
                                  {option.name}
                                  {option.requiresQuote && <span className="text-text-body">(skræddersyet, kontakt os)</span>}
                                </label>
                              ) : null,
                            )}
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            )
          })}
        </div>

        {!needsVisit && emergency && (
          <fieldset className={CARD}>
            <legend className="contents">
              <span className={STEP_HEADING}>
                <StepNumber>{step++}</StepNumber>
                Hvornår skal det være?
              </span>
            </legend>
            <div className="mt-5 grid grid-cols-1 gap-3 min-[768px]:grid-cols-3">
              {PERIODS.map((item) => (
                <label key={item.value} className={CHOICE}>
                  <input
                    type="radio"
                    name="period"
                    value={item.value}
                    checked={period === item.value}
                    onChange={() => setPeriod(item.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs leading-[18px] text-text-body">{item.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        </div>
      </div>

      <aside
        id="price-summary"
        ref={summaryRef}
        className={`${CARD} flex scroll-mt-24 flex-col gap-5 min-[992px]:sticky min-[992px]:top-28`}
        aria-live="polite"
      >
        <h2 className="font-heading text-xl leading-[26px] font-light text-ink-800">{onlyStore ? 'Køb i butikken' : 'Vejledende pris'}</h2>

        {!selections.length && (
          <p className="text-sm text-text-body">{!postcodeDone ? 'Skriv dit postnummer for at komme videre.' : category ? 'Vælg en eller flere ydelser for at se en pris.' : 'Vælg hvad der skal laves for at se en pris.'}</p>
        )}

        {/* Kørslen vises i prisboksen, så snart postnummeret er skrevet. Med en regnet pris står den som linje i listen. */}
        {result.pending.map((name) => (
          <p key={name} className="text-sm text-text-body">
            Vælg en mulighed under {name} for at se prisen.
          </p>
        ))}

        {!result.lines.length && !onlyStore && !result.pending.length && result.drivingAmount ? (
          <div>
            <dl className="flex flex-col gap-2 border-t border-[#e4e8ef] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-body">Kørsel</dt>
                <dd className="shrink-0 text-ink-800">{formatKr(result.drivingAmount)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-xs text-text-body">{vatLabel}</p>
          </div>
        ) : null}

        {awaitingPostcode && <p className="text-sm text-text-body">Skriv dit postnummer i trin 2 for at se prisen. Kørslen er en del af prisen.</p>}

        {result.lines.length > 0 && !awaitingPostcode && (
          <div>
            <p className="font-heading text-[32px] leading-[1.2] font-light tracking-[-0.03em] text-ink-800">
              {result.low === result.high ? formatKr(result.total) : `${formatKr(result.low)} til ${formatKr(result.high)}`}
            </p>
            <p className="mt-1 text-xs text-text-body">{vatLabel}</p>
            <dl className="mt-5 flex flex-col gap-2 border-t border-[#e4e8ef] pt-4 text-sm">
              {result.lines.map((line, index) => (
                <Fragment key={index}>
                  {line.group && line.group !== result.lines[index - 1]?.group && (
                    <div className="mt-1 flex justify-between gap-4 text-ink-800">
                      <dt>{line.group}</dt>
                      <dd className="shrink-0">
                        {formatKr(result.lines.filter((item) => item.group === line.group).reduce((sum, item) => sum + item.amount, 0))}
                      </dd>
                    </div>
                  )}
                  <div className={`flex justify-between gap-4 ${line.group ? 'pl-3 text-xs text-text-body' : ''}`}>
                    <dt className="text-text-body">{line.label}</dt>
                    <dd className={`shrink-0 ${line.group ? 'text-text-body' : 'text-ink-800'}`}>{formatKr(line.amount)}</dd>
                  </div>
                </Fragment>
              ))}
              <div className="mt-1 flex justify-between gap-4 border-t border-[#e4e8ef] pt-3 font-medium text-ink-800">
                <dt>I alt</dt>
                <dd className="shrink-0">{formatKr(result.total)}</dd>
              </div>
            </dl>
            {result.drivingUnknown && (
              <p className="mt-3 text-xs text-text-body">
                {driving?.status === 'outside'
                  ? `Kørsel er ikke regnet med. ${outsideText}`
                  : driving?.status === 'unknown'
                    ? 'Kørsel er ikke regnet med, postnummeret blev ikke fundet.'
                    : 'Kørsel er ikke regnet med, indtast et postnummer.'}
              </p>
            )}
          </div>
        )}

        {result.fromPrices.length > 0 && (
          <div className={result.lines.length ? 'border-t border-[#e4e8ef] pt-4' : ''}>
            <p className="text-xs font-medium tracking-[0.08em] text-ink-muted uppercase">Kræver besigtigelse</p>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              {result.fromPrices.map((item) => (
                <div key={item.label} className="flex justify-between gap-4">
                  <dt className="text-text-body">{item.label}</dt>
                  <dd className="shrink-0 text-ink-800">{item.amount == null ? 'Efter aftale' : `fra ${formatKr(item.amount)}`}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Kun butiksvarer: overskriften siger det, så kun teksten og en vej til butikken. */}
        {onlyStore && (
          <div className="flex flex-col gap-5">
            {storeTexts.map((text) => (
              <p key={text} className="text-sm leading-[21px] text-text-body">
                {text}
              </p>
            ))}
            <Link href={ROUTES.contact()} className="button-outline w-full">
              Find vores butikker
            </Link>
          </div>
        )}

        {/* Sammen med regnede ydelser: samme linjer som prisen, og teksten som en note. */}
        {result.inStore.length > 0 && !onlyStore && (
          <div className="border-t border-[#e4e8ef] pt-4">
            <dl className="flex flex-col gap-2 text-sm">
              {result.inStore.map((item) => (
                <div key={item.label} className="flex justify-between gap-4">
                  <dt className="text-text-body">{item.label}</dt>
                  <dd className="shrink-0 text-ink-800">I butikken</dd>
                </div>
              ))}
            </dl>
            {storeTexts.map((text) => (
              <p key={text} className="mt-3 text-xs leading-[18px] text-text-body">
                {text}
              </p>
            ))}
          </div>
        )}

        {settings.disclaimer && needsQuote && !awaitingPostcode && <p className="text-xs leading-[18px] text-text-body">{settings.disclaimer}</p>}

        {/* Akut: telefonen er hovedvejen. Formularen lover svar inden for 24 timer, og det passer ikke til en akut sag. */}
        {emergency && phone && (
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="button-accent h-[52px] w-full text-base">
            Ring {phone}
          </a>
        )}

        {form && needsQuote && !awaitingPostcode && !emergency && !showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="button-accent h-[52px] w-full text-base">
            Få et uforpligtende tilbud
          </button>
        )}
        {form && showForm && (
          <div className="border-t border-[#e4e8ef]">
            <DynamicForm form={form} variant="card" extraData={[{ field: 'prisberegning', value: summary }]} />
          </div>
        )}
      </aside>

      {selections.length > 0 && !summaryInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4e8ef] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)] min-[992px]:hidden">
          <div className="site-container flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-text-body">Vejledende pris{result.lines.length && !awaitingPostcode ? `, ${vatLabel}` : ''}</p>
              <p className="truncate font-heading text-lg leading-6 font-light text-ink-800">{barPrice}</p>
            </div>
            <a
              href="#price-summary"
              // Et anker scroller ikke igen, når adressen allerede slutter på #price-summary.
              onClick={(event) => {
                event.preventDefault()
                summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="button-accent shrink-0"
            >
              Se prisen
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

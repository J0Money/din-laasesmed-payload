'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { DynamicForm } from '@/components/forms/DynamicForm'
import {
  calculatePrice,
  CUSTOMER_TYPES,
  type CustomerType,
  departmentDistances,
  formatKr,
  hasDriving,
  type Period,
  type PriceResult,
  PERIODS,
  type Selection,
  unitLabel,
} from '@/lib/priceCalculator'
import { ROUTES } from '@/lib/routes'
import type { Form, PriceCalculator, PriceService } from '@/payload-types'

type Category = PriceService['category']

const CATEGORIES: { hint: string; label: string; value: Category }[] = [
  { label: 'Akut hjælp', hint: 'Låst ude eller akut brug for hjælp', value: 'emergency' },
  { label: 'Mekanisk sikring', hint: 'Låse, cylindre og nøgler', value: 'mechanical' },
  { label: 'Elektronisk sikring', hint: 'Adgangskontrol, dørtelefoni og videoovervågning', value: 'electronic' },
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

/**
 * Postnummeret som en pinkode: fire felter med ét ciffer hver. Markøren hopper selv videre og tilbage,
 * og et indsat postnummer fordeles over felterne. Det første felt har id "price-postcode", så trinnets label peger på det.
 */
function PostcodePin({
  onChange,
  status,
  value,
}: {
  onChange: (value: string) => void
  /** "valid": kendt postnummer (grønne felter). "invalid": ukendt (røde felter, der ryster). */
  status: 'invalid' | 'valid' | null
  value: string
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  // Den seneste værdi, også før React har tegnet felterne igen, så hurtige tryk (fx en holdt backspace) ikke går tabt.
  const current = useRef(value)
  current.current = value
  const set = (next: string) => {
    current.current = next
    onChange(next)
  }
  const focus = (index: number) => inputs.current[Math.max(0, Math.min(3, index))]?.focus()

  // Ryster hver gang et ukendt postnummer er skrevet færdigt (klassen fjernes og sættes igen, så animationen starter forfra).
  const group = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = group.current
    if (status !== 'invalid' || !element) return
    element.classList.remove('animate-shake')
    void element.offsetWidth
    element.classList.add('animate-shake')
  }, [status, value])

  const fieldColor =
    status === 'valid'
      ? 'border-green-600 bg-green-50 text-green-800'
      : status === 'invalid'
        ? 'border-accent-red bg-red-50 text-accent-red'
        : 'border-[#ced5e1] bg-[#f9fafb] text-ink-800 hover:border-ink-muted'

  return (
    <div ref={group} className="flex gap-2" role="group" aria-label="Postnummer, fire cifre" aria-invalid={status === 'invalid' || undefined}>
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          id={index === 0 ? 'price-postcode' : undefined}
          aria-label={index === 0 ? undefined : `Ciffer ${index + 1}`}
          inputMode="numeric"
          autoComplete={index === 0 ? 'postal-code' : 'off'}
          maxLength={4}
          value={value[index] ?? ''}
          onFocus={(event) => {
            // Man kan ikke springe et tomt felt over: fokus går til det første tomme.
            if (index > current.current.length) focus(current.current.length)
            else event.target.select()
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '')
            if (!digits) return
            // Et helt postnummer (autofyld) erstatter det hele.
            if (digits.length === 4) {
              set(digits)
              focus(3)
              return
            }
            // Det, der blev skrevet, erstatter cifrene fra dette felt og frem.
            const typed = ((event.nativeEvent as InputEvent).data ?? digits).replace(/\D/g, '')
            if (!typed) return
            const old = current.current
            set((old.slice(0, index) + typed + old.slice(index + typed.length)).slice(0, 4))
            focus(index + typed.length)
          }}
          onKeyDown={(event) => {
            const old = current.current
            if (event.key === 'Backspace') {
              event.preventDefault()
              if (old[index]) set(old.slice(0, index) + old.slice(index + 1))
              else if (index > 0) {
                set(old.slice(0, index - 1))
                focus(index - 1)
              }
            } else if (event.key === 'ArrowLeft') focus(index - 1)
            else if (event.key === 'ArrowRight') focus(index + 1)
          }}
          onPaste={(event) => {
            event.preventDefault()
            const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
            if (digits) {
              set(digits)
              focus(digits.length)
            }
          }}
          className={`h-14 w-12 rounded-lg border text-center font-heading text-2xl font-light outline-none transition-colors ${fieldColor} ${status ? '' : 'focus:border-brand-500 focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-brand-500)]'}`}
          suppressHydrationWarning
        />
      ))}
    </div>
  )
}

/**
 * Et beløb, der tæller fra det forrige til det nye på ca. et halvt sekund (hurtigt først, blødt til sidst).
 * Første gang tæller det fra 0. Afbrydes en optælling af en ny pris, fortsætter den fra det viste tal.
 */
function CountUpKr({ value }: { value: number }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value
      setShown(value)
      return
    }
    const start = from.current
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 500)
      const eased = 1 - (1 - progress) ** 3
      const next = Math.round(start + (value - start) * eased)
      from.current = next
      setShown(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{formatKr(shown)}</>
}

/** Totalprisen (eller intervallet) med optælling. Skærmlæsere får kun slutbeløbet, ikke hvert tal undervejs. */
function PriceCount({ high, low, total }: { high: number; low: number; total: number }) {
  const exact = low === high
  return (
    <>
      <span aria-hidden>
        {exact ? (
          <CountUpKr value={total} />
        ) : (
          <>
            <CountUpKr value={low} /> til <CountUpKr value={high} />
          </>
        )}
      </span>
      <span className="sr-only">{exact ? formatKr(total) : `${formatKr(low)} til ${formatKr(high)}`}</span>
    </>
  )
}

// Værdierne i adressen: /prisberegner?type=erhverv&kategori=akut&postnummer=8000
const CUSTOMER_PARAMS: Record<string, CustomerType> = { privat: 'private', erhverv: 'business' }
const CATEGORY_PARAMS: Record<string, Category> = { akut: 'emergency', mekanisk: 'mechanical', elektronisk: 'electronic' }
const paramFor = <T extends string>(map: Record<string, T>, value: T) => Object.keys(map).find((key) => map[key] === value)

/**
 * Prisopdelingen: totalen, linjerne og ydelser, der kræver besigtigelse. Bruges i prisboksen og i tilbudspop-up'en, så de viser det samme.
 * showLines false skjuler totalen og linjerne (prisboksen, mens postnummeret mangler).
 */
function PriceBreakdown({
  outsideText,
  result,
  showLines,
  totalText,
  vatLabel,
}: {
  outsideText: string
  result: PriceResult
  showLines: boolean
  totalText: string
  vatLabel: string
}) {
  const driving = result.driving
  return (
    <>
      {result.lines.length > 0 && showLines && (
        <div>
          <p className="font-heading text-[32px] leading-[1.2] font-light tracking-[-0.03em] text-ink-800 tabular-nums">
            <PriceCount low={result.low} high={result.high} total={result.total} />
          </p>
          <p className="mt-1 text-xs text-text-body">{vatLabel}</p>
          <dl className="mt-5 flex flex-col gap-2 border-t border-[#e4e8ef] pt-4 text-sm">
            {/* Alle linjer på samme niveau: ydelsen med produktprisen, antal på sin egen linje og al arbejdstid samlet til sidst. */}
            {result.lines.map((line, index) => (
              <div key={index} className="flex justify-between gap-4">
                <dt className="text-text-body">{line.label}</dt>
                <dd className="shrink-0 text-ink-800">{line.amount == null ? (line.text ?? '') : formatKr(line.amount)}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-4 border-t border-[#e4e8ef] pt-3 font-medium text-ink-800">
              <dt>I alt</dt>
              <dd className="shrink-0">{totalText}</dd>
            </div>
          </dl>
          {result.drivingUnknown && (
            <p className="mt-3 text-xs text-text-body">
              {driving?.status === 'outside'
                ? `Kørsel er ikke medregnet. ${outsideText}`
                : driving?.status === 'unknown'
                  ? 'Kørsel er ikke medregnet, postnummeret blev ikke fundet.'
                  : 'Kørsel er ikke medregnet, indtast et postnummer.'}
            </p>
          )}
        </div>
      )}

    </>
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
  // Adressen kan udfylde beregneren: ?type=erhverv&kategori=akut&postnummer=7000. Ukendte værdier ignoreres,
  // og bogstaver og overskydende cifre i postnummeret også.
  const searchParams = useSearchParams()
  const [customerType, setCustomerType] = useState<CustomerType>(() => CUSTOMER_PARAMS[searchParams.get('type') ?? ''] ?? 'private')
  const [category, setCategory] = useState<Category | null>(() => {
    const fromUrl = CATEGORY_PARAMS[searchParams.get('kategori') ?? '']
    return fromUrl && categories.includes(fromUrl) ? fromUrl : null
  })
  const [chosen, setChosen] = useState<Chosen>({})
  const [period, setPeriod] = useState<Period>('day')
  const [postcode, setPostcode] = useState(() => (searchParams.get('postnummer') ?? '').replace(/\D/g, '').slice(0, 4))
  const [showForm, setShowForm] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Under 992px ligger prisboksen nederst, så en bjælke viser prisen, indtil boksen selv er i billedet.
  const summaryRef = useRef<HTMLElement>(null)
  const [summaryInView, setSummaryInView] = useState(false)

  useEffect(() => {
    // Adressen følger valgene, så et link kan deles og overleve en genindlæsning. replaceState i stedet for push, så tilbage-knappen
    // ikke skal gennem hvert klik. Privat er standard og står ikke i adressen; et delvist postnummer skrives ikke.
    const params = new URLSearchParams(window.location.search)
    if (customerType === 'business') params.set('type', 'erhverv')
    else if (params.get('type') === 'erhverv') params.delete('type')
    if (category) params.set('kategori', paramFor(CATEGORY_PARAMS, category)!)
    if (postcode.length === 4) params.set('postnummer', postcode)
    else if (params.get('postnummer')?.length === 4) params.delete('postnummer')

    const query = params.toString()
    if (query !== window.location.search.replace(/^\?/, '')) {
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
    }
  }, [customerType, category, postcode])

  useEffect(() => {
    // Pop-up'en åbnes som modal (fokus låses, og Esc lukker), og siden bagved scroller ikke.
    const dialog = dialogRef.current
    if (!dialog) return
    if (showForm && !dialog.open) dialog.showModal()
    if (!showForm && dialog.open) dialog.close()
    document.body.style.overflow = showForm ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showForm])

  useEffect(() => {
    // ?postnummer= uden (hele) postnummeret: send besøgende til trin 2, med markøren i det første tomme felt. Kun ved indlæsning.
    if (!searchParams.has('postnummer') || postcode.length === 4) return
    const fields = document.getElementById('price-postcode')?.parentElement?.querySelectorAll('input')
    const field = fields?.[postcode.length]
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const selections: Selection[] = services
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
  // Ingen regnet pris (kun prisinterval eller køb i butikken), så tidspunktet er ligegyldigt.
  const needsVisit =
    selections.length > 0 &&
    selections.every((s) => ['inStore', 'priceRange'].includes(services.find((service) => service.id === s.serviceId)?.pricingModel ?? ''))

  const result = calculatePrice({ customerType, period, postcode, selections, services, settings })
  // Kun butiksvarer valgt: intet tilbud at sende, og disclaimeren om montøren passer ikke.
  const needsQuote = result.lines.length > 0
  const onlyStore = !needsQuote && result.inStore.length > 0
  const storeTexts = [...new Set(result.inStore.flatMap((item) => (item.text ? [item.text] : [])))]
  const driving = result.driving
  // Kørsel er en del af prisen, så summen vises først, når postnummeret er skrevet.
  // Et ukendt postnummer låser ikke op: uden det kan kørslen ikke regnes.
  const postcodeDone = !drivingEnabled || (/^[0-9]{4}$/.test(postcode) && driving?.status !== 'unknown')
  const awaitingPostcode = drivingEnabled && result.lines.length > 0 && driving === null
  const outsideText = settings.outsideAreaText || 'Kørsel aftales, når vi kontakter dig.'
  const drivingNote =
    driving?.status === 'outside' ? outsideText : driving?.status === 'unknown' ? 'Vi kan ikke finde postnummeret. Tjek, at det er skrevet rigtigt.' : null
  const vatLabel = result.includesVat ? 'inkl. moms' : 'ekskl. moms'
  // Totalen som ét beløb eller et interval (procent-intervallet fra globalen og ydelser med prisinterval).
  const totalText = result.low === result.high ? formatKr(result.total) : `${formatKr(result.low)} til ${formatKr(result.high)}`
  const barPrice = awaitingPostcode ? 'Indtast postnummer' : result.lines.length ? totalText : 'Køb i butikken'

  // En kategori vises, hvis der er ydelser i den; akut også med blot et telefonnummer.
  const categoryChoices = CATEGORIES.filter(
    (item) =>
      categories.includes(item.value) &&
      (services.some((service) => service.category === item.value) || (item.value === 'emergency' && Boolean(phone))),
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

  const toggleOption = (serviceId: string, optionId: string) =>
    setChosen((current) => {
      const ids = current[serviceId].optionIds
      return {
        ...current,
        [serviceId]: { ...current[serviceId], optionIds: ids.includes(optionId) ? ids.filter((id) => id !== optionId) : [...ids, optionId] },
      }
    })

  // Det, der sendes med formularen, så montøren kan se hvad kunden har valgt og fået vist.
  const summary = [
    `Kundetype: ${CUSTOMER_TYPES.find((t) => t.value === customerType)?.label}`,
    // Som i prisboksen: alle linjer på samme niveau, i samme rækkefølge.
    ...result.lines.map((line) =>
      line.amount == null ? (line.text ? `${line.label}: ${line.text}` : line.label) : `${line.label}: ${formatKr(line.amount)}`,
    ),
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
      ? `Vejledende pris: ${totalText} ${vatLabel}`
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

        {/* Altid vist, også ved ydelser uden regnet pris: postnummeret er nyttigt for tilbuddet, og trinnumrene skal ikke skifte undervejs. */}
        {drivingEnabled && (
          <div className={CARD}>
            <label htmlFor="price-postcode" className={STEP_HEADING}>
              <StepNumber>{step++}</StepNumber>
              Hvor skal vi komme ud?
            </label>
            <div className="mt-5 flex flex-col gap-4">
              <PostcodePin
                value={postcode}
                onChange={setPostcode}
                status={postcode.length < 4 ? null : driving?.status === 'unknown' ? 'invalid' : 'valid'}
              />
              {drivingNote && (
                <p aria-live="polite" className="text-sm text-text-body">
                  {drivingNote}
                </p>
              )}
              {/* Afdelingerne fra admin. Den nærmeste (som vi kører fra) lyser op, når postnummeret er kendt. */}
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3" aria-live="polite">
                {departmentDistances(settings, postcode).map((department) => {
                  const nearest = driving != null && driving.status !== 'unknown' && driving.department === department.name
                  return (
                    <li
                      key={department.name}
                      className={`flex min-h-[92px] flex-col gap-1.5 rounded-xl border px-4 py-4 text-sm transition-colors duration-300 ${
                        nearest ? 'border-brand-500 bg-brand-500/5 shadow-[inset_0_0_0_1px_var(--color-brand-500)]' : 'border-[#e4e8ef] bg-[#f9fafb]'
                      }`}
                    >
                      <span className={`flex items-center gap-2 text-base font-medium ${nearest ? 'text-brand-500' : 'text-ink-800'}`}>
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
                          <path
                            d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                        {department.name}
                      </span>
                      <span className="text-sm text-text-body">{department.km == null ? 'Afdeling' : department.km < 1 ? 'Under 1 km' : `Ca. ${department.km} km`}</span>
                      {nearest && <span className="text-sm font-medium text-brand-500">Nærmeste afdeling</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
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
              <span className="font-medium">Står du låst ude?</span> Ring til vores døgnvagt på{' '}
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="whitespace-nowrap underline hover:text-brand-500">
                {phone}
              </a>
              , så hjælper vi dig. Du kan også få et vejledende prisoverslag her.
            </p>
          )}

          {CATEGORIES.filter((group) => group.value === category).map((group) => {
            const items = services.filter((service) => service.category === group.value)
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
                                    type="checkbox"
                                    name={`option-${service.id}`}
                                    checked={selected.optionIds.includes(option.id)}
                                    onChange={() => toggleOption(service.id, option.id!)}
                                    className="h-4 w-4 accent-brand-500"
                                  />
                                  {option.name}
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl leading-[26px] font-light text-ink-800">{onlyStore ? 'Køb i butikken' : 'Vejledende pris'}</h2>
          {/* Viser altid, hvilken kundetype og moms prisen gælder for. */}
          {!onlyStore && (
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500">
              {CUSTOMER_TYPES.find((type) => type.value === customerType)?.label} · {customerType === 'private' ? 'inkl. moms' : 'ekskl. moms'}
            </span>
          )}
        </div>

        {!selections.length && (
          <p className="text-sm text-text-body">{!postcodeDone ? 'Indtast dit postnummer for at komme videre.' : category ? 'Vælg en eller flere ydelser for at se prisen.' : 'Vælg, hvad du har brug for hjælp til, for at se prisen.'}</p>
        )}

        {/* Kørslen vises i prisboksen, så snart postnummeret er skrevet. Med en regnet pris står den som linje i listen. */}
        {!result.lines.length && !onlyStore && result.drivingAmount ? (
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

        {awaitingPostcode && <p className="text-sm text-text-body">Indtast dit postnummer i trin 2 for at se prisen. Kørsel er en del af prisen.</p>}

        <PriceBreakdown result={result} vatLabel={vatLabel} totalText={totalText} outsideText={outsideText} showLines={!awaitingPostcode} />

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

        {form && needsQuote && !awaitingPostcode && !emergency && (
          <button type="button" onClick={() => setShowForm(true)} className="button-accent h-[52px] w-full text-base">
            Få et uforpligtende tilbud
          </button>
        )}
      </aside>

      {/* Tilbudsformularen i en pop-up: det valgte og prisen øverst, så kunden kan se, hvad der sendes. Indholdet findes kun, mens den er åben. */}
      {form && (
        <dialog
          ref={dialogRef}
          onClose={() => setShowForm(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowForm(false)
          }}
          aria-labelledby="price-quote-title"
          className="m-auto max-h-[calc(100dvh-32px)] w-[min(920px,calc(100%-32px))] max-w-none overflow-y-auto rounded-2xl border border-[#e4e8ef] bg-white p-0 text-ink-800 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop:bg-ink-900/60 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:rounded-none max-sm:border-0"
        >
          {showForm && (
            <div className="p-(--fluid-form-pad)">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="price-quote-title" className="font-heading text-xl leading-[26px] font-light text-ink-800">
                    Få et uforpligtende tilbud
                  </h2>
                  <p className="mt-1 text-sm text-text-body">Vi kontakter dig inden for 24 timer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Luk"
                  className="-mt-1 -mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-2xl leading-none text-text-body hover:bg-[#f2f5f9] hover:text-ink-800"
                >
                  ×
                </button>
              </div>
              {/* Prisen først på mobil, og til højre på desktop: samme opdeling som i prisboksen. */}
              <div className="mt-2 grid gap-6 min-[820px]:grid-cols-[minmax(0,1fr)_320px] min-[820px]:gap-10">
                <DynamicForm
                  form={form}
                  variant="card"
                  defaults={{ postnummer: postcode }}
                  extraData={[{ field: 'prisberegning', value: summary }]}
                />
                <div className="order-first flex flex-col gap-4 self-start rounded-xl bg-[#f9fafb] p-5 min-[820px]:sticky min-[820px]:top-0 min-[820px]:order-last min-[820px]:mt-6">
                  <p className="text-xs font-medium tracking-[0.08em] text-ink-muted uppercase">
                    Vejledende pris · {customerType === 'private' ? 'Privat' : 'Erhverv'}
                  </p>
                  <PriceBreakdown result={result} vatLabel={vatLabel} totalText={totalText} outsideText={outsideText} showLines />
                  {settings.disclaimer && <p className="text-xs leading-[18px] text-text-body">{settings.disclaimer}</p>}
                </div>
              </div>
            </div>
          )}
        </dialog>
      )}

      {selections.length > 0 && !summaryInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4e8ef] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)] min-[992px]:hidden">
          <div className="site-container flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-text-body">Vejledende pris{result.lines.length && !awaitingPostcode ? `, ${vatLabel}` : ''}</p>
              <p className="truncate font-heading text-lg leading-6 font-light text-ink-800 tabular-nums">
                {result.lines.length && !awaitingPostcode ? <PriceCount low={result.low} high={result.high} total={result.total} /> : barPrice}
              </p>
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

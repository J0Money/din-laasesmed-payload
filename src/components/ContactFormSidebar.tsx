'use client'

import { useState } from 'react'

/** Servicevalg hentet 1:1 fra formularen på din-laasesmed.dk. */
const SERVICE_OPTIONS = [
  'Gratis servicetjek',
  'Omkodning af låse',
  'Montering af nye låse',
  'Ekstra nøgler',
  'Pengeskabe',
  'Adgangskontrol',
  'Videoovervågning',
  'Dørtelefoni og dørautomatik',
  'Erhvervsprojekt',
  'Andet',
]

const inputClass =
  'mt-1 h-10 w-full rounded-md border-[0.8px] border-[#ced5e1] bg-[#f9fafb] px-3 text-sm text-ink-800 outline-none placeholder:text-text-body/60 hover:border-ink-muted focus:border-brand-500'

/**
 * "Brug for hjælp?"-formularen fra artikel-siderne. Mål aflæst fra .cta_form på originalen.
 * Indsendelse er endnu ikke koblet til en backend.
 */
export function ContactFormSidebar() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="rounded-2xl border-[0.8px] border-[#ced5e1] bg-surface-form px-7 py-5">
      <h2 className="text-trim mt-5 font-heading text-[32px] leading-9 font-light text-ink-800">Brug for hjælp?</h2>
      <p className="mt-[13px] text-xs leading-[18px] text-text-body">Vi kontakter dig inden for 24 timer</p>

      {submitted ? (
        <p className="mt-6 text-ink-800">Tak for din henvendelse. Vi kontakter dig inden for 24 timer.</p>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <label className="mb-[5px] block">
            <span className="block text-xs leading-[18px] text-ink-800">Navn</span>
            <input name="name" type="text" required placeholder="For- og efternavn" className={inputClass} />
          </label>

          <label className="mb-[5px] block">
            <span className="block text-xs leading-[18px] text-ink-800">Service</span>
            <select
              name="service"
              required
              defaultValue=""
              className="mt-1 mb-[10px] h-[38px] w-full border-[0.8px] border-[#cccccc] bg-[#f3f3f3] px-3 text-sm text-[#333333]"
            >
              <option value="" disabled>
                Vælg service
              </option>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Originalen bruger medium vægt på netop disse to labels. */}
          <label className="mb-[5px] block">
            <span className="block text-xs leading-[18px] font-medium text-ink-800">Telefonnummer</span>
            <input name="phone" type="tel" required placeholder="12 34 56 78" className={inputClass} />
          </label>

          <label className="mb-[5px] block">
            <span className="block text-xs leading-[18px] font-medium text-ink-800">Mail</span>
            <input name="email" type="email" required placeholder="mail@gmail.com" className={inputClass} />
          </label>

          <button type="submit" className="button-accent h-[51px] w-full text-base">
            Send forespørgsel
          </button>
        </form>
      )}
    </div>
  )
}

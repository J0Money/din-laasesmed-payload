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

/**
 * "Brug for hjælp?"-kontaktformularen, der vises i sidebaren på artikel-sider.
 * Indsendelse er endnu ikke koblet til en backend — se plan for næste skridt.
 */
export function ContactFormSidebar() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-2xl bg-surface-form px-7 py-5">
        <p className="text-ink-800">Tak for din henvendelse — vi kontakter dig inden for 24 timer.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-surface-form px-7 py-5">
      <h2 className="font-heading text-3xl font-light text-ink-800">Brug for hjælp?</h2>
      <p className="mt-1 text-sm text-text-body">Vi kontakter dig inden for 24 timer</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
        }}
      >
        <div>
          <label htmlFor="contact-name" className="text-sm text-text-body">
            Navn
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="For- og efternavn"
            className="mt-1 w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact-service" className="text-sm text-text-body">
            Service
          </label>
          <select
            id="contact-service"
            name="service"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm"
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
        </div>

        <div>
          <label htmlFor="contact-phone" className="text-sm text-text-body">
            Telefonnummer
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            placeholder="12 34 56 78"
            className="mt-1 w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm text-text-body">
            Mail
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="mail@gmail.com"
            className="mt-1 w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm"
          />
        </div>

        <button type="submit" className="button-accent w-full">
          Send forespørgsel
        </button>
      </form>
    </div>
  )
}

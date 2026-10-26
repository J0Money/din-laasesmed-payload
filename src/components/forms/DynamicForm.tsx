'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { Form } from '@/payload-types'

type FormField = NonNullable<Form['fields']>[number] & {
  mediumLabel?: boolean | null
  placeholder?: string | null
  showWhen?: string | null
}

/** Ren tekst fra et Lexical-dokument (til afkrydsningsfeltets indledende tekst). */
function plainText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = ((node as { root?: unknown }).root ?? node) as { children?: unknown[]; text?: string; type?: string }
  if (typeof n.text === 'string') return n.text
  const inner = (n.children ?? []).map(plainText)
  return n.type === 'root' ? inner.join(' ') : inner.join('')
}

function redirectTarget(form: Form): string | undefined {
  const redirect = form.redirect
  if (!redirect) return undefined
  if (redirect.type === 'reference' && redirect.reference && typeof redirect.reference.value === 'object') {
    return `/${(redirect.reference.value as { slug?: string }).slug ?? ''}`
  }
  return redirect.url || undefined
}

const CARD_INPUT =
  'mt-1 h-(--fluid-icon) w-full rounded-md border-[0.8px] border-[#ced5e1] bg-[#f9fafb] px-3 text-sm text-ink-800 outline-none placeholder:text-text-body/60 hover:border-ink-muted focus:border-brand-500'
const PAGE_INPUT =
  'h-10 w-full rounded-md border border-[#ced5e1] bg-[#f9fafb] px-3 text-sm text-ink-800 outline-none placeholder:text-text-body/60 hover:border-ink-muted focus:border-brand-500'

/**
 * Gengiver en form builder-formular og sender den til /api/form-submissions.
 * "card" er "Brug for hjælp?"-kortet (mål fra .cta_form), "page" er Nøgleformularens fulde bredde.
 * Felter med "vis kun når" vises først, når det angivne afkrydsningsfelt er markeret, og sendes ellers ikke med.
 */
export function DynamicForm({
  form,
  variant,
  heading,
}: {
  form: Form
  heading?: string
  variant: 'card' | 'page'
}) {
  const router = useRouter()
  const fields = (form.fields ?? []) as FormField[]
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => 'name' in field && field.name)
        .map((field) => [
          (field as { name: string }).name,
          field.blockType === 'checkbox' ? Boolean((field as { defaultValue?: boolean }).defaultValue) : '',
        ]),
    ),
  )
  const [status, setStatus] = useState<'done' | 'error' | 'idle' | 'sending'>('idle')

  const isVisible = (field: FormField) => !field.showWhen || values[field.showWhen] === true
  const set = (name: string, value: string | boolean) => setValues((current) => ({ ...current, [name]: value }))

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const submissionData = fields
      .filter((field) => 'name' in field && field.name && isVisible(field))
      .map((field) => {
        const name = (field as { name: string }).name
        const value = values[name]
        return { field: name, value: typeof value === 'boolean' ? (value ? 'Ja' : 'Nej') : String(value ?? '') }
      })
    // Originalen sender også hvilken side formularen blev udfyldt på.
    submissionData.push({ field: 'side', value: window.location.pathname })

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.id, submissionData }),
      })
      if (!response.ok) throw new Error(String(response.status))

      const target = form.confirmationType === 'redirect' ? redirectTarget(form) : undefined
      if (target) router.push(target)
      else setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p className="text-ink-800">{plainText(form.confirmationMessage) || 'Tak for din henvendelse.'}</p>
  }

  const card = variant === 'card'
  const inputClass = card ? CARD_INPUT : PAGE_INPUT

  return (
    <form
      onSubmit={onSubmit}
      className={card ? 'mt-6 flex flex-col gap-4' : 'flex flex-col gap-4'}
    >
      {heading && (
        <h1 className="text-trim mt-5 mb-[10px] self-start font-heading text-[40px] leading-[52px] font-light text-ink-800">
          {heading}
        </h1>
      )}

      {fields.map((field, index) => {
        if (!isVisible(field)) return null
        const key = field.id ?? ('name' in field ? field.name : field.blockType)

        const renderCheckbox = (box: FormField) => {
          if (box.blockType !== 'checkbox') return null
          return (
            <label key={box.id ?? box.name} className="flex cursor-pointer items-center gap-2 self-start text-sm leading-[21px] text-ink-800">
              <input
                type="checkbox"
                name={box.name}
                checked={values[box.name] === true}
                onChange={(event) => set(box.name, event.target.checked)}
                className="peer sr-only"
              />
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border border-[rgba(34,41,59,0.25)] text-transparent peer-checked:bg-ink-800 peer-checked:text-white peer-focus-visible:border-ink-800">
                <svg viewBox="0 0 12 9" fill="none" className="h-2 w-[11px]" aria-hidden>
                  <path d="M1 4.5 4.2 7.5 11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {box.label ?? box.name}
            </label>
          )
        }

        if (field.blockType === 'message') {
          const next = fields[index + 1]
          // Teksten lige før et afkrydsningsfelt er dets <legend>; sammen er de en fieldset med 8px mellem (som på originalen).
          if (next?.blockType === 'checkbox' && isVisible(next)) {
            return (
              <fieldset key={key} className="flex flex-col gap-2 self-start">
                <legend className="mb-2 p-0 text-sm leading-[21px] text-ink-800">{plainText(field.message)}</legend>
                {renderCheckbox(next)}
              </fieldset>
            )
          }
          return (
            <p key={key} className="text-sm leading-[21px] text-ink-800">
              {plainText(field.message)}
            </p>
          )
        }
        if (!('name' in field)) return null
        if (field.blockType === 'checkbox') {
          // Allerede vist sammen med teksten foran.
          return fields[index - 1]?.blockType === 'message' ? null : renderCheckbox(field)
        }

        const name = field.name
        const label = field.label ?? name
        const required = Boolean('required' in field && field.required)
        const labelClass = `block text-xs leading-[18px] text-ink-800 ${field.mediumLabel ? 'font-medium' : ''}`
        const wrapper = card ? 'mb-[5px] block' : 'flex flex-col gap-1'

        if (field.blockType === 'select') {
          return (
            <label key={key} className={wrapper}>
              <span className={labelClass}>{label}</span>
              <select
                name={name}
                required={required}
                value={String(values[name] ?? '')}
                onChange={(event) => set(name, event.target.value)}
                className={
                  card
                    ? 'mt-1 mb-[10px] h-[38px] w-full border-[0.8px] border-[#cccccc] bg-[#f3f3f3] px-3 text-sm text-[#333333]'
                    : 'h-[38px] w-full border border-[#cccccc] bg-[#f3f3f3] px-3 text-sm text-[#333333]'
                }
              >
                <option value="" disabled>
                  {field.placeholder || 'Vælg'}
                </option>
                {(field.options ?? []).map((option) => (
                  <option key={option.id ?? option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )
        }

        if (field.blockType === 'textarea') {
          return (
            <label key={key} className={wrapper}>
              <span className={labelClass}>{label}</span>
              <textarea
                name={name}
                required={required}
                placeholder={field.placeholder ?? undefined}
                value={String(values[name] ?? '')}
                onChange={(event) => set(name, event.target.value)}
                rows={4}
                className={`${inputClass} h-auto py-2`}
              />
            </label>
          )
        }

        const type = field.blockType === 'email' ? 'email' : field.blockType === 'number' ? 'number' : name.startsWith('tele') ? 'tel' : 'text'
        return (
          <label key={key} className={wrapper}>
            <span className={labelClass}>{label}</span>
            <input
              name={name}
              type={type}
              required={required}
              placeholder={field.placeholder ?? undefined}
              value={String(values[name] ?? '')}
              onChange={(event) => set(name, event.target.value)}
              className={inputClass}
              // Autofill-udvidelser (adgangskodeadministratorer) tilføjer stil på felterne, før React er indlæst.
              suppressHydrationWarning
            />
          </label>
        )
      })}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="button-accent h-[52px] w-full text-base disabled:opacity-60"
      >
        {form.submitButtonLabel || 'Send forespørgsel'}
      </button>

      {status === 'error' && (
        <p role="alert" className="text-sm text-accent-red">
          {(form as Form & { errorMessage?: string | null }).errorMessage || 'Noget gik galt, prøv igen eller ring til os.'}
        </p>
      )}
    </form>
  )
}

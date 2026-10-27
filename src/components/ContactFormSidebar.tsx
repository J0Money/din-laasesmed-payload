import { DynamicForm } from '@/components/forms/DynamicForm'
import { getPayloadClient } from '@/lib/payload'
import type { Form } from '@/payload-types'

/**
 * "Brug for hjælp?"-kortet ved siden af artikler, mærker og i blokken "Artikel med formular". Mål aflæst fra
 * .cta_form på originalen. Formularen vælges i blokken, ellers bruges den, der er valgt i Site Settings.
 */
export async function ContactFormSidebar({ form }: { form?: Form | null | string }) {
  const payload = await getPayloadClient()

  let id: null | string | undefined = typeof form === 'string' ? form : form?.id
  if (!id) {
    const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
    id = typeof settings.ctaForm === 'string' ? settings.ctaForm : settings.ctaForm?.id
  }
  if (!id) return null

  // Hentes igen med dybde, så en omdirigering til en side kender sidens adresse.
  const doc = await payload.findByID({ collection: 'forms', id, depth: 1 }).catch(() => null)
  if (!doc) return null

  return (
    <div className="rounded-2xl border-[0.8px] border-[#ced5e1] bg-surface-form px-(--fluid-form-pad) py-5 max-[767px]:py-6">
      <h2 className="text-trim mt-5 font-heading text-(length:--fluid-article-name) leading-9 font-light text-ink-800">
        {doc.heading || 'Brug for hjælp?'}
      </h2>
      <p className="mt-[14px] text-xs leading-[18px] text-text-body">
        {doc.subheading || 'Vi kontakter dig inden for 24 timer'}
      </p>
      <DynamicForm form={doc} variant="card" />
    </div>
  )
}

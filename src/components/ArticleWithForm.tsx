import { ContactFormSidebar } from '@/components/ContactFormSidebar'
import type { Form } from '@/payload-types'

/**
 * Artikel med "Brug for hjælp?"-formularen i siden, som på originalens kontakt- og mærkesider (1600px):
 * 896px billede (16:9), 40px overskrift og tekst, 400px formular med 48px mellemrum.
 */
export function ArticleWithForm({
  imageUrl,
  imageAlt = '',
  heading,
  className = '',
  form,
  formFirst = false,
  overlapPrevious = false,
  children,
}: {
  imageUrl?: string
  imageAlt?: string
  heading: string
  className?: string
  form?: Form | null | string
  /** Under 992px står formularen før artiklen (som på originalens mærkesider). */
  formFirst?: boolean
  /** Sektionen rykkes op over blokken før (videobåndet), og kun den del under båndet får baggrund. */
  overlapPrevious?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={`py-(--fluid-section) ${overlapPrevious ? 'relative -mt-(--overlap) [--overlap:7rem]' : 'bg-background'} ${className}`}
    >
      {overlapPrevious && <div aria-hidden className="absolute inset-x-0 top-(--overlap) bottom-0 bg-background" />}
      <div className={`site-container relative z-10 lg:flex lg:items-start lg:justify-center lg:gap-12 ${formFirst ? 'max-[767px]:flex max-[767px]:flex-col' : ''}`}>
        <article className="flex min-w-0 flex-col gap-8 lg:shrink-0 lg:basis-[min(896px,calc(100%-297px))]">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imageAlt}
              className="aspect-video w-full rounded-2xl object-cover shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            />
          )}
          <div className="flex flex-col items-start gap-12">
            <h1 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-h2) leading-[1.3] font-light text-ink-800">
              {heading}
            </h1>
            {children}
          </div>
        </article>

        <aside className={`${formFirst ? 'max-[767px]:order-first max-[767px]:mt-0 max-[767px]:mb-1' : ''} mt-6 lg:sticky lg:top-8 lg:mt-0 lg:max-w-[400px] lg:flex-1`}>
          <ContactFormSidebar form={form} />
        </aside>
      </div>
    </section>
  )
}

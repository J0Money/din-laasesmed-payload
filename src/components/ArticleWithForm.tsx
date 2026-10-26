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
  children,
}: {
  imageUrl?: string
  imageAlt?: string
  heading: string
  className?: string
  form?: Form | null | string
  children: React.ReactNode
}) {
  return (
    <section className={`bg-background py-(--fluid-section) ${className}`}>
      <div className="site-container relative z-10 lg:flex lg:items-start lg:justify-center lg:gap-12">
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

        <aside className="mt-12 lg:sticky lg:top-8 lg:mt-0 lg:max-w-[400px] lg:flex-1">
          <ContactFormSidebar form={form} />
        </aside>
      </div>
    </section>
  )
}

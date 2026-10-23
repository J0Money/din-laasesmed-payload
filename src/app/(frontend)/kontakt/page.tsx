import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactFormSidebar } from '@/components/ContactFormSidebar'
import { CertificateIcon, ClockIcon, MailIcon, ShopIcon } from '@/components/home/HomeIcons'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Kontakt Din Låsesmed i Aarhus | Få hjælp til låse og sikkerhed',
}

type ContactCard = {
  icon: React.ComponentType<{ className?: string }>
  text: string
  cta: string
  href: string
  external?: boolean
  filled?: boolean
}

/**
 * Kontaktsiden, mål aflæst fra din-laasesmed.dk/kontakt ved 1600px:
 * 453px video-bånd, fire kontaktkort der overlapper båndet med 32px,
 * og en artikel (billede, overskrift, tekst) med "Brug for hjælp?"-formularen i siden.
 */
export default async function ContactPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'siteSettings' })

  const phone = siteSettings.phone ?? ''
  const email = siteSettings.email ?? ''
  // Butikkens adresse står som på originalen (inkl. "Abyhøj"), derfor fra afdelingen og ikke virksomhedsadressen.
  const address = siteSettings.departments?.[0]?.address ?? siteSettings.address ?? ''

  const cards: ContactCard[] = [
    {
      icon: ClockIcon,
      text: 'Ring til os når du har brug for døgnvagt eller rådgivning',
      cta: phone,
      href: `tel:+45${phone.replace(/\s/g, '')}`,
      filled: true,
    },
    {
      icon: ShopIcon,
      text: `Besøg os på ${address}`,
      cta: 'Rutevejledning',
      href: `https://www.google.com/maps?daddr=${encodeURIComponent(address)}`,
      external: true,
    },
    {
      icon: MailIcon,
      text: `Skriv til os på ${email}`,
      cta: 'Skriv til os',
      href: `mailto:${email}?subject=Henvendelse`,
    },
    {
      icon: CertificateIcon,
      text: 'ISO-certificeret kvalitet du kan stole på',
      cta: 'ISO 9001',
      href: ROUTES.page('iso-9001'),
    },
  ]

  return (
    <main>
      <div className="relative h-[453px] overflow-hidden bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/videos/butik-poster.avif" alt="Butik reception" className="absolute inset-0 h-full w-full object-cover" />
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/videos/butik.webm" type="video/webm" />
          <source src="/videos/butik.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 -mt-8">
        <ul className="site-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li
              key={card.cta}
              className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e4e8ef] bg-white px-7 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[#edf0f3]">
                  <card.icon className="h-auto w-4" />
                </span>
                <p className="font-heading leading-5 font-medium text-ink-800">{card.text}</p>
              </div>
              <Link
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
                className={`flex items-center justify-center gap-4 rounded-lg border px-4 py-[12.8px] font-heading text-xl leading-[30px] transition-colors duration-200 ${
                  card.filled
                    ? 'border-white bg-brand-500 text-white hover:bg-[#52a24d]'
                    : 'border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-[#edf0f3]'
                }`}
              >
                <card.icon className="h-auto w-[18px]" />
                <span className="text-base leading-6">{card.cta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <section className="bg-background py-20">
        <div className="site-container relative z-10 lg:flex lg:items-start lg:justify-center lg:gap-12">
          <article className="flex min-w-0 flex-col gap-8 lg:shrink-0 lg:basis-[min(896px,calc(100%-297px))]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kontakt.avif"
              alt=""
              className="aspect-video w-full rounded-2xl object-cover shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            />
            <div className="flex flex-col items-start gap-12">
              <h1 className="text-trim mt-5 mb-[10px] font-heading text-[40px] leading-[52px] font-light text-ink-800">
                Kontakt Din Låsesmed
              </h1>
              <div className="rich-text [&>:last-child]:mb-0">
                <p>
                  Har du brug for hjælp til låse, adgangskontrol eller anden sikring? Hos Din Låsesmed står vi klar til
                  at rådgive dig – uanset om det drejer sig om en akut situation eller et større projekt. Vi dækker hele{' '}
                  <Link href={ROUTES.article('find-lasesmed')}>Aarhus og omegn</Link> og er kun et opkald eller en mail
                  væk.
                </p>
                <p>Vi ser frem til at høre fra dig!</p>
              </div>
            </div>
          </article>

          <aside className="mt-12 lg:sticky lg:top-8 lg:mt-0 lg:max-w-[400px] lg:flex-1">
            <ContactFormSidebar />
          </aside>
        </div>
      </section>
    </main>
  )
}

import Link from 'next/link'

import { ArticleWithForm } from '@/components/ArticleWithForm'
import { CertificateIcon, ClockIcon, MailIcon, ShopIcon } from '@/components/home/HomeIcons'
import { ROUTES } from '@/lib/routes'

type ContactCard = {
  icon: React.ComponentType<{ className?: string }>
  text: string
  cta: string
  href: string
  external?: boolean
  filled?: boolean
}

/**
 * Fælles skabelon for afdelingssiderne (/kontakt for Aarhus, /laasesmed-aalborg), mål aflæst fra
 * din-laasesmed.dk ved 1600px: 453px video-bånd, fire kontaktkort der overlapper båndet med 32px,
 * og en artikel (billede, overskrift, tekst) med "Brug for hjælp?"-formularen i siden (ArticleWithForm).
 */
export function DepartmentContactPage({
  phone,
  address,
  email,
  heading,
  children,
}: {
  phone: string
  address: string
  email: string
  heading: string
  children: React.ReactNode
}) {
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

      <ArticleWithForm imageUrl="/images/kontakt.avif" heading={heading}>
        {children}
      </ArticleWithForm>
    </main>
  )
}

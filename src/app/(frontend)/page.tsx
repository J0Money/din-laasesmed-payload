import Link from 'next/link'

import { CertificateIcon, ClockIcon, HandshakeIcon, LockShieldIcon, StoreIcon } from '@/components/home/HomeIcons'
import { StatCounter } from '@/components/home/StatCounter'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'

const FEATURES = [
  {
    icon: LockShieldIcon,
    title: 'Komplet løsning under ét tag.',
    text: 'Vi leverer hele din sikringsløsning fra rådgivning til installation og service.',
  },
  {
    icon: ClockIcon,
    title: 'Døgnvagt, når du har brug for det.',
    text: 'Vores montører står klar 24/7 til hurtig og pålidelig udrykning.',
  },
  {
    icon: CertificateIcon,
    title: 'ISO-certificeret kvalitet du kan stole på.',
    text: 'Vi arbejder efter anerkendte standarder med fokus på sikkerhed og kvalitet.',
  },
  {
    icon: HandshakeIcon,
    title: 'Dygtige montører med erfaring.',
    text: 'Specialister med faglig stolthed og praktisk viden sikrer et solidt resultat.',
  },
]

export default async function HomePage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'home' })

  const visualImageUrl = mediaUrl(home.visual?.image, 'ratio32')
  const mekaniskImageUrl = mediaUrl(home.focusCards?.mekaniskImage)
  const elektroniskImageUrl = mediaUrl(home.focusCards?.elektroniskImage)
  const serviceImageUrl = mediaUrl(home.focusCards?.serviceImage)

  return (
    <main>
      {/* Hero: mål fra din-laasesmed.dk — 640px højt, video fylder hele båndet, tekst centreret. */}
      <section className="relative h-[640px] overflow-hidden bg-ink-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/25" />

        <div className="site-container relative z-10 flex h-full flex-col items-center justify-center text-center">
          <h1 className="flex flex-wrap items-center justify-center gap-3 font-heading text-[32px] leading-[1.1] font-light text-[#edf0f3] sm:gap-5 sm:text-[48px] sm:leading-[1]">
            <span>Din Låsesmed</span>
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#edf0f3]" />
            <span>Din tryghed</span>
          </h1>

          <div className="mt-6 flex items-center gap-4">
            <Link href={ROUTES.contact()} className="button-accent gap-3">
              <StoreIcon className="h-4 w-4" />
              Gratis servicetjek
            </Link>
            <Link href={ROUTES.contact()} className="button">
              Kontakt os
            </Link>
          </div>
        </div>
      </section>

      {/* Den rette løsning: eyebrow + overskrift + 2x2 features, med kvadratisk billede og CTA til højre. */}
      <section className="site-container py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-brand-500">Din lokale låsesmed siden 1992</p>
            <h2 className="text-trim mt-3 mb-10 font-heading text-[40px] leading-[1.2] font-light text-ink-800">
              Den rette løsning
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <feature.icon className="mt-1 h-5 w-5 shrink-0 text-brand-500" />
                  <p className="text-text-body">
                    <span className="font-medium text-ink-800">{feature.title}</span> {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {visualImageUrl && (
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={visualImageUrl}
                alt={mediaAlt(home.visual?.image)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-6 bottom-6">
                <Link href={ROUTES.contact()} className="button-accent w-full gap-3">
                  <StoreIcon className="h-4 w-4" />
                  {home.visual?.ctaLabel || 'Besøg os i Aarhus'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Kundeudtalelse (lys) + statistik-bånd (mørkt). */}
      <section className="bg-surface-muted py-20">
        <div className="site-container">
          <p className="text-sm font-medium text-brand-500">Hvad siger vores kunder</p>
          <h2 className="text-trim mt-3 mb-8 font-heading text-[40px] leading-[1.2] font-light text-ink-800">
            Udtalelser
          </h2>

          {home.testimonial?.quote && (
            <blockquote className="max-w-2xl">
              <p className="text-trim font-heading text-2xl leading-snug font-light text-ink-800">
                &quot;{home.testimonial.quote}&quot;
              </p>
              {home.testimonial.author && (
                <footer className="mt-4 text-sm text-ink-muted">{home.testimonial.author}</footer>
              )}
            </blockquote>
          )}
        </div>
      </section>

      {home.stats && home.stats.length > 0 && (
        <section className="bg-ink-900 py-10">
          <div className="site-container grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {home.stats.map((stat) => (
              <div key={stat.id ?? stat.label}>
                <p className="font-heading text-2xl font-medium text-[#edf0f3]">
                  <StatCounter value={stat.value} />
                </p>
                <p className="mt-1 text-sm text-[#e4e8ef]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tre fokus-kort: Mekanisk sikring / servicetjek-CTA / Elektronisk sikring. */}
      <section className="site-container py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Link
            href={ROUTES.category('mekanisk-sikring')}
            className="group relative flex h-[480px] flex-col justify-start overflow-hidden rounded-2xl p-6"
          >
            {mekaniskImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mekaniskImageUrl}
                alt="Mekanisk sikring"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="relative flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow-sm">
              <LockShieldIcon className="h-4 w-4 text-brand-500" />
              Mekanisk sikring
            </span>
          </Link>

          <div className="flex h-[480px] flex-col justify-between rounded-2xl bg-ink-900 p-8">
            <div>
              <h3 className="text-trim font-heading text-2xl leading-snug font-light text-[#edf0f3]">
                Få et uforpligtende servicetjek
              </h3>
              <p className="mt-4 text-[#e4e8ef]">
                Vores låsekonsulent kommer ud og vurderer dine nuværende løsninger, så du får tryghed og overblik
                uden forpligtelser.
              </p>
              <Link href={ROUTES.contact()} className="button-accent mt-6 gap-3">
                Bestil service
              </Link>
            </div>

            {serviceImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={serviceImageUrl} alt="" className="-mx-8 -mb-8 h-32 w-[calc(100%+64px)] object-cover" />
            )}
          </div>

          <Link
            href={ROUTES.category('elektronisk-sikring')}
            className="group relative flex h-[480px] flex-col justify-start overflow-hidden rounded-2xl p-6"
          >
            {elektroniskImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={elektroniskImageUrl}
                alt="Elektronisk sikring"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="relative flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow-sm">
              <ClockIcon className="h-4 w-4 text-brand-500" />
              Elektronisk sikring
            </span>
          </Link>
        </div>
      </section>

      {/* Erhvervskunder: 3-kolonne masonry med logoer og fotos. */}
      {home.businessCustomers && home.businessCustomers.length > 0 && (
        <section className="site-container pb-24">
          <p className="text-center text-sm font-medium text-brand-500">Fra havedøren til havudsigt</p>
          <h2 className="text-trim mt-3 mb-10 text-center font-heading text-[40px] leading-[1.2] font-light text-ink-800">
            Mød vores erhvervskunder
          </h2>

          <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 [&>*]:mb-8">
            {home.businessCustomers.map((customer) => {
              const url = mediaUrl(customer.image)
              if (!url) return null

              return (
                <div
                  key={customer.id ?? url}
                  className="relative overflow-hidden rounded-2xl break-inside-avoid"
                >
                  {customer.type === 'logo' ? (
                    <div
                      className="flex aspect-[2/1] items-center justify-center p-10"
                      style={{ backgroundColor: customer.bgColor || '#ffffff' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={mediaAlt(customer.image)} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={mediaAlt(customer.image)} className="h-full w-full object-cover" />
                      {customer.label && (
                        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-900">
                          {customer.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

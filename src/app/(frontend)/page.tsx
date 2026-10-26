import type { Metadata } from 'next'
import Link from 'next/link'

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { HOME_BUTTON, SectionHeadline } from '@/components/home/SectionHeadline'
import {
  ButtonCheckIcon,
  CertificateIcon,
  ClockIcon,
  HandshakeIcon,
  LockShieldIcon,
  PinIcon,
  PlusCircleIcon,
  StoreIcon,
} from '@/components/home/HomeIcons'
import { ParallaxImage } from '@/components/home/ParallaxImage'
import { StatCounter } from '@/components/home/StatCounter'
import { TestimonialSlider } from '@/components/home/TestimonialSlider'
import { LockIcon, SignalIcon } from '@/components/layout/NavIcons'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { HOME_PAGE_SLUG, ROUTES } from '@/lib/routes'

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

async function getHomePage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: HOME_PAGE_SLUG }, _status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage()
  if (!page) return {}
  return { title: page.titleTag || page.title, description: page.metaDescription || undefined }
}

/**
 * Mål aflæst fra din-laasesmed.dk ved 1600px viewport, sektion for sektion.
 * Findes der en udgivet Payload-side med slug "forside", vises den (bygget af blokke). Ellers bruges den faste
 * forside herunder, hvis indhold ligger i Home-globalen. Den faste forside fjernes, når siden er flyttet over.
 */
export default async function HomePage() {
  const homePage = await getHomePage()
  if (homePage) {
    return (
      <main>
        <BlockRenderer blocks={homePage.layout} />
      </main>
    )
  }

  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'home' })

  // Originalfilen, ikke en Payload-størrelse: de faste størrelser beskærer portrætbilledet til landskab.
  const visualImageUrl = mediaUrl(home.visual?.image)
  const statsImageUrl = mediaUrl(home.statsImage, 'hero')
  const mekaniskImageUrl = mediaUrl(home.focusCards?.mekaniskImage)
  const elektroniskImageUrl = mediaUrl(home.focusCards?.elektroniskImage)
  const serviceImageUrl = mediaUrl(home.focusCards?.serviceImage)

  return (
    <main>
      <section className="relative h-[640px] overflow-hidden bg-ink-900">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="site-container relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center">
          <h1 className="mt-5 mb-[10px] flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-heading text-[32px] leading-[1.2] font-light text-[#edf0f3] sm:text-[48px] sm:leading-[48px]">
            <span className="text-trim">Din Låsesmed</span>
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#edf0f3]" />
            <span className="text-trim">Din tryghed</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href={ROUTES.article('uforpligtende-servicetjek')} className={`button-accent ${HOME_BUTTON}`}>
              <span className="text-trim">Gratis servicetjek</span>
              <ButtonCheckIcon className="h-auto w-4" />
            </Link>
            <Link href={ROUTES.contact()} className={`button ${HOME_BUTTON}`}>
              <span className="text-trim">Kontakt os</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        {/* Billedet er en tredjedel af containeren (426.67px), teksten fylder resten og centreres lodret. */}
        <div className="site-container grid grid-cols-1 gap-8 lg:grid-cols-[1fr_calc((100%-64px)/3)]">
          <div className="flex flex-col justify-center gap-12">
            <SectionHeadline tagline="Din lokale låsesmed siden 1992" title="Den rette løsning" leading="leading-[60px]" />

            <div className="grid max-w-[768px] grid-cols-1 gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[#edf0f3]">
                    <feature.icon className="h-[19px] w-4" />
                  </span>
                  <p className="text-text-body">
                    <strong className="font-bold">{feature.title}</strong> {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {visualImageUrl && (
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visualImageUrl} alt={mediaAlt(home.visual?.image)} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-x-8 bottom-6">
                <Link href={ROUTES.contact()} className={`button-accent w-full ${HOME_BUTTON} py-[18.4px]`}>
                  <span className="text-trim">{home.visual?.ctaLabel || 'Besøg os i Aarhus'}</span>
                  <StoreIcon className="h-auto w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {home.testimonials && home.testimonials.length > 0 && (
        <section className="bg-surface-muted py-20">
          <div className="mx-auto flex w-full max-w-[1117px] flex-col items-start justify-center gap-10 px-4 lg:flex-row lg:gap-16 lg:px-0">
            <div className="shrink-0">
              <SectionHeadline tagline="Hvad siger vores kunder" title="Udtalelser" />
            </div>
            <TestimonialSlider testimonials={home.testimonials} />
          </div>
        </section>
      )}

      {home.stats && home.stats.length > 0 && (
        <section className="relative overflow-hidden border-b-[0.8px] border-[#e4ebf3] bg-ink-900">
          {statsImageUrl && <ParallaxImage src={statsImageUrl} alt="" />}
          <div className="absolute inset-0 z-[1] bg-ink-900 opacity-80" />

          <div className="site-container relative z-10 grid grid-cols-2 gap-y-12 py-[112px] lg:flex lg:items-center lg:justify-around">
            {home.stats.map((stat) => (
              <div key={stat.id ?? stat.label} className="flex flex-col items-center justify-center gap-3 text-center lg:w-60">
                <div className="flex items-center justify-center gap-2 text-[#edf0f3]">
                  <span className="font-heading text-[48px] leading-[48px] font-light">
                    <StatCounter value={stat.value} />
                  </span>
                  <PlusCircleIcon />
                </div>
                <p className="text-trim text-sm leading-[21px] text-surface-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="site-container grid grid-cols-1 gap-8 lg:grid-cols-3">
          <FocusImageCard
            href={ROUTES.category('mekanisk-sikring')}
            imageUrl={mekaniskImageUrl}
            label="Mekanisk sikring"
            icon={<LockIcon className="h-5 w-5" />}
          />

          <Link
            href={ROUTES.contact()}
            className="group flex h-[480px] flex-col items-start justify-between gap-10 overflow-hidden rounded-2xl bg-ink-900 pt-16 text-[#ced5e1]"
          >
            <div className="flex w-full flex-col gap-8 px-10">
              <h3 className="text-trim mt-5 mb-[10px] text-center font-heading text-2xl leading-[26.4px] font-normal text-[#edf0f3]">
                Få et uforpligtende servicetjek
              </h3>
              <p className="text-center text-sm leading-[21px]">
                Vores låsekonsulent kommer ud og vurderer dine nuværende løsninger, så du får tryghed og overblik
                uden forpligtelser.
              </p>
              <div className="flex justify-center">
                <span
                  className={`button-accent ${HOME_BUTTON} group-hover:border-background group-hover:bg-background group-hover:text-ink-800`}
                >
                  <span className="text-trim">Bestil service</span>
                  <ButtonCheckIcon className="h-auto w-4" />
                </span>
              </div>
            </div>
            {serviceImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={serviceImageUrl} alt="" className="h-[178px] w-full shrink-0 object-cover" />
            )}
          </Link>

          <FocusImageCard
            href={ROUTES.category('elektronisk-sikring')}
            imageUrl={elektroniskImageUrl}
            label="Elektronisk sikring"
            icon={<SignalIcon className="h-5 w-5" />}
          />
        </div>
      </section>

      {home.businessCustomers && home.businessCustomers.length > 0 && (
        <section className="bg-surface-muted py-20">
          <div className="site-container flex flex-col gap-12">
            <SectionHeadline tagline="Fra havedøren til havudsigt" title="Mød vores erhvervskunder" center />

            <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
              {home.businessCustomers.map((customer) => {
                const url = mediaUrl(customer.image)
                if (!url) return null

                return (
                  <div key={customer.id ?? url} className="mb-8 break-inside-avoid overflow-hidden rounded-2xl">
                    {customer.type === 'logo' ? (
                      <div
                        className="flex aspect-[2/1] items-center justify-center"
                        style={{ backgroundColor: customer.bgColor || '#ffffff' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={mediaAlt(customer.image)}
                          className="max-w-full object-contain"
                          style={{ height: customer.logoHeight ?? 96 }}
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={mediaAlt(customer.image)} className="absolute inset-0 h-full w-full object-cover" />
                        {customer.label && (
                          <span className="absolute bottom-8 left-8 flex items-center gap-[9.6px] rounded-lg bg-[rgba(34,41,59,0.25)] px-4 py-3 text-[#edf0f3] backdrop-blur-[5px]">
                            <PinIcon />
                            <span className="font-heading text-xs leading-[18px]">{customer.label}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function FocusImageCard({
  href,
  imageUrl,
  label,
  icon,
}: {
  href: string
  imageUrl?: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <Link href={href} className="group relative block h-[480px] overflow-hidden rounded-2xl px-10 pt-10">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <span className="absolute inset-0 z-[1] bg-[rgba(34,41,59,0.25)]" />
      <span className="relative z-10 inline-flex items-center gap-3 rounded-lg bg-background px-6 py-[13.6px] text-brand-500 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-colors duration-200 group-hover:bg-ink-900 group-hover:text-white">
        {icon}
        <span className="text-trim font-heading text-sm leading-[15.4px]">{label}</span>
      </span>
    </Link>
  )
}

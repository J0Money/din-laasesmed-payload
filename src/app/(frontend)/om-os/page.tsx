import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import { EmployeeCard } from '@/components/about/EmployeeCard'
import { HelpCard } from '@/components/about/HelpCard'
import { ArticleWithForm } from '@/components/ArticleWithForm'
import { ShopVideoHero } from '@/components/contact/ShopVideoHero'
import { ParallaxImage } from '@/components/home/ParallaxImage'
import { Slider } from '@/components/Slider'
import { getPayloadClient } from '@/lib/payload'
import { ROUTES } from '@/lib/routes'
import type { Employee } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Din Låsesmed i Aarhus – Lokalt forankret låsesmed siden 1992',
  description:
    'Mød Din Låsesmed i Aarhus – din lokale ekspert i låse og sikkerhed. Over 30 års erfaring og certificeret kvalitet.',
}

// Grupperne i originalens rækkefølge; "Har du brug for hjælp?"-kortet står først i Administration og Aalborg.
const GROUPS: { type: NonNullable<Employee['type']>; title: string; helpCard: boolean }[] = [
  { type: 'administration', title: 'Administration', helpCard: true },
  { type: 'montoerer', title: 'Montører', helpCard: false },
  { type: 'aalborg', title: 'Aalborg', helpCard: true },
]

const HISTORY = [
  { src: '/images/om-os/historie-1.avif', alt: 'Din Låsesmed butik i Aarhus tilbage i 2002.' },
  { src: '/images/om-os/historie-2.avif', alt: 'Din Låsesmed varevogn foran butik i 2002.' },
  { src: '/images/om-os/historie-3.avif', alt: 'Din Låsesmed varevogn foran butik i 2002.' },
  { src: '/images/om-os/historie-4.avif', alt: '' },
  { src: '/images/om-os/historie-5.avif', alt: 'Din Låsesmed butik i Aarhus tilbage i 2002.' },
]

/**
 * Om os, mål aflæst fra din-laasesmed.dk/om-os ved 1600px: butiksvideo, artikel med formular der overlapper
 * videoen med 7rem, mørkt motto-bånd med parallax, medarbejdere i tre grupper og "Vores historie"-slider.
 */
export default async function AboutPage() {
  const payload = await getPayloadClient()
  const [siteSettings, employees] = await Promise.all([
    payload.findGlobal({ slug: 'siteSettings' }),
    payload.find({
      collection: 'employees',
      where: { showOnAbout: { not_equals: false } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    }),
  ])
  const phone = siteSettings.phone ?? ''
  const email = siteSettings.email ?? ''

  return (
    <main>
      <ShopVideoHero />

      <ArticleWithForm imageUrl="/videos/butik-poster.avif" heading="Om Din Låsesmed" className="relative -mt-28">
        <div className="rich-text w-full [&>:last-child]:mb-0">
          <p>
            Din Låsesmed har siden 1992 leveret trygge og pålidelige løsninger inden for låseservice og elektronisk
            sikring. Virksomheden blev grundlagt af Anton Nygaard og drives i dag videre af Per Nygaard, som har
            videreført visionen om høj kvalitet og personlig service.
          </p>
          <p>
            Med over 30 års erfaring er vi en fast del af sikkerhedsbranchen i Aarhus og omegn. Vi rådgiver, installerer
            og servicerer alt fra mekaniske låse til avancerede adgangssystemer – både for private, virksomheder og
            institutioner.
          </p>
          <h2>Vores værdier og engagement</h2>
          <p>
            Vi tror på faglighed, tillid og god service. Det gælder både i vores daglige arbejde og i vores rolle som en
            aktiv del af lokalsamfundet. Derfor støtter vi blandt andet Brydeklubben Thrott i Aarhus samt det vigtige
            arbejde, som Danske Hospitalsklovne udfører for indlagte børn i Danmark.
          </p>
          <h2>Certificering og medlemskab</h2>
          <p>
            Din Låsesmed er <Link href={ROUTES.page('iso-9001')}>ISO 9001:2015-certificeret</Link>, hvilket er din garanti
            for dokumenteret kvalitet og høj kundetilfredshed. Vi er desuden medlem af Dansk Låsesmedeforening (DLF) og
            Sikkerhedsbranchen – begge garant for faglig integritet og sikkerhed på højeste niveau.
          </p>
          <h2>Et team du kan regne med</h2>
          <p>
            Fra vores base i Åbyhøj dækker vi hele Aarhus-området med 13 dygtige og engagerede medarbejdere. Vores
            teknikere er veluddannede og erfarne, og de står klar til at hjælpe med alt fra{' '}
            <Link href={ROUTES.article('oplukning-af-doer')}>akutte oplukninger</Link> til projektering og implementering
            af komplette sikkerhedssystemer.
          </p>
          <p>
            Vi lytter til dine behov og finder en løsning, der matcher dine krav og dit budget – altid med sikkerhed og
            driftssikkerhed i fokus.
          </p>
          {/* Originalens tekst slutter med et tomt afsnit (Webflow-pladsholder), der gør sektionen 23px højere. */}
          <p aria-hidden>&zwj;</p>
        </div>
      </ArticleWithForm>

      {/* Originalens størrelser her er flydende mellem 320 og 1440px viewport (maks. ved 1440px og op):
          tekst 36→48px (28→32px under 480px), mellemrum 28→32px og padding 64→112px. */}
      <section className="relative flex items-center justify-center overflow-hidden py-[clamp(64px,calc(64px+48*(100vw-320px)/1120),112px)]">
        <ParallaxImage src="/images/om-os/motto.avif" alt="" />
        <div aria-hidden className="absolute inset-0 z-[2] bg-ink-900 opacity-80" />
        <div className="site-container relative z-[3] flex items-center justify-center gap-[clamp(28px,calc(28px+4*(100vw-320px)/1120),32px)]">
          {['Din Låsesmed', 'Din tryghed'].map((text, index) => (
            <Fragment key={text}>
              {index > 0 && <span aria-hidden className="mt-[15px] hidden h-3 w-3 shrink-0 rounded-full bg-[#edf0f3] md:block" />}
              <p className="text-trim mt-5 mb-[10px] font-heading text-[clamp(28px,calc(28px+4*(100vw-320px)/1120),32px)] leading-none font-light whitespace-nowrap text-[#edf0f3] min-[480px]:text-[clamp(36px,calc(36px+12*(100vw-320px)/1120),48px)]">
                {text}
              </p>
            </Fragment>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="site-container flex flex-col gap-12">
          {GROUPS.map((group) => {
            const members = employees.docs.filter((employee) => employee.type === group.type)
            if (!members.length) return null
            return (
              <div key={group.type} className="flex flex-col gap-8">
                <h3 className="text-trim mt-5 mb-[10px] font-heading text-[32px] leading-[48px] font-light text-ink-800">
                  {group.title}
                </h3>
                <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[768px]:grid-cols-3 min-[992px]:grid-cols-4">
                  {group.helpCard && <HelpCard phone={phone} />}
                  {members.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} fallbackEmail={email} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="overflow-hidden bg-white py-20">
        <div className="site-container">
          <Slider title="Vores historie" gap={24}>
            {HISTORY.map((image) => (
              <li
                key={image.src}
                className="w-full shrink-0 overflow-hidden rounded-2xl border border-[#ced5e1] bg-surface-form transition-[border-color,box-shadow] duration-200 hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] min-[992px]:w-[calc((100%-24px)/2)]"
              >
                <a href={image.src} className="block aspect-[3/2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover" />
                </a>
              </li>
            ))}
          </Slider>
        </div>
      </section>
    </main>
  )
}

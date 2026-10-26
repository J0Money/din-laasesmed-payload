import type { Block } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import type { JobListBlock as JobListBlockProps } from '@/payload-types'

/**
 * Jobliste (Webflow: Section / Overview / Jobs): udgivne stillinger, nyeste først. Rykkes 32px op under
 * intro-båndet. Er der ingen, vises en grå besked. Originalens liste er tom og siger "Der er ingen artikler."
 * (Webflows standardtekst), her kan teksten rettes.
 */
export const jobListBlock: Block = {
  slug: 'jobList',
  interfaceName: 'JobListBlock',
  labels: { singular: 'Jobliste', plural: 'Joblister' },
  fields: [
    {
      name: 'emptyText',
      type: 'text',
      label: 'Tekst når der ingen stillinger er',
      defaultValue: 'Der er ingen ledige stillinger lige nu.',
    },
  ],
}

export async function JobList({ emptyText }: JobListBlockProps) {
  const payload = await getPayloadClient()
  const [siteSettings, jobs] = await Promise.all([
    payload.findGlobal({ slug: 'siteSettings' }),
    payload.find({
      collection: 'jobs',
      where: { _status: { equals: 'published' } },
      sort: ['-publishedAt', '-createdAt'],
      limit: 100,
    }),
  ])

  return (
    <section className="relative -mt-8 pb-(--fluid-section)">
      <div className="site-container relative z-10">
        {jobs.docs.length === 0 ? (
          // Originalens boks er 53px høj (21px tekst mellem 16px luft), ikke 56px.
          <div className="rounded-lg bg-[#ced5e1] px-6 py-4 leading-[21px] text-ink-800">
            {emptyText || 'Der er ingen ledige stillinger lige nu.'}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.docs.map((job) => {
              const email = job.applyEmail || siteSettings.email
              return (
                <li
                  key={job.id}
                  className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e4e8ef] bg-white px-7 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex flex-col gap-2">
                    {job.location && <p className="text-sm leading-[21px] font-medium text-brand-500">{job.location}</p>}
                    <h3 className="font-heading text-xl leading-[22px] text-ink-800">{job.title}</h3>
                    {job.summary && <p className="text-sm leading-[21px]">{job.summary}</p>}
                  </div>
                  {email && (
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(`Ansøgning: ${job.title}`)}`}
                      className="button w-full"
                    >
                      Send ansøgning
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

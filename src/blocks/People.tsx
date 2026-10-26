import type { Block } from 'payload'

import { EmployeeCard } from '@/components/about/EmployeeCard'
import { HelpCard } from '@/components/about/HelpCard'
import { getPayloadClient } from '@/lib/payload'
import type { PeopleBlock as PeopleBlockProps } from '@/payload-types'

/** Medarbejdere i grupper (Webflow: Section / People). Hvem der vises og i hvilken rækkefølge styres på medarbejderne. */
export const peopleBlock: Block = {
  slug: 'people',
  interfaceName: 'PeopleBlock',
  labels: { singular: 'Medarbejdere', plural: 'Medarbejdere' },
  fields: [
    {
      name: 'groups',
      type: 'array',
      label: 'Grupper',
      minRows: 1,
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          label: 'Overskrift',
        },
        {
          name: 'group',
          type: 'select',
          required: true,
          label: 'Vis medarbejdere af typen',
          options: [
            { label: 'Administration', value: 'administration' },
            { label: 'Montører', value: 'montoerer' },
            { label: 'Aalborg', value: 'aalborg' },
          ],
        },
        {
          name: 'showHelpCard',
          type: 'checkbox',
          label: 'Vis "Har du brug for hjælp?"-kortet først',
          defaultValue: false,
        },
      ],
    },
  ],
}

export async function People({ groups }: PeopleBlockProps) {
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

  return (
    <section className="py-(--fluid-section)">
      <div className="site-container flex flex-col gap-12">
        {(groups ?? []).map((group) => {
          const members = employees.docs.filter((employee) => employee.type === group.group)
          if (!members.length) return null
          return (
            <div key={group.id} className="flex flex-col gap-8">
              <h3 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-ink-800">
                {group.heading}
              </h3>
              <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[768px]:grid-cols-3 min-[992px]:grid-cols-4">
                {group.showHelpCard && <HelpCard phone={siteSettings.phone ?? ''} />}
                {members.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} fallbackEmail={siteSettings.email ?? ''} />
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}

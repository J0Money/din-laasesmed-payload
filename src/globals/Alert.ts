import type { GlobalConfig, GroupField } from 'payload'

import { linkField } from '../fields/link'

export const Alert: GlobalConfig = {
  slug: 'alert',
  label: 'Besked i toppen',
  admin: {
    group: 'Konfiguration',
    description: 'En bjælke øverst på alle sider, fx ved lukkedage eller ændrede åbningstider. Slå den fra, når den ikke skal vises.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Vis beskeden',
      defaultValue: false,
    },
    {
      name: 'message',
      type: 'text',
      label: 'Besked',
      maxLength: 160,
      admin: {
        description: 'Hold den kort, så den kan være på én til to linjer på mobil.',
        condition: (data) => Boolean(data?.enabled),
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: { enabled?: boolean } }) =>
        siblingData?.enabled && !value?.trim() ? 'Skriv en besked, eller slå visning fra.' : true,
    },
    {
      name: 'hasLink',
      type: 'checkbox',
      label: 'Tilføj et link',
      defaultValue: false,
      admin: { condition: (data) => Boolean(data?.enabled) },
    },
    {
      ...(linkField as GroupField),
      admin: { condition: (data) => Boolean(data?.enabled && data?.hasLink) },
    },
  ],
}

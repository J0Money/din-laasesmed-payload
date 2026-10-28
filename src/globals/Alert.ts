import type { GlobalConfig, GroupField } from 'payload'

import { linkField } from '../fields/link'

export const Alert: GlobalConfig = {
  slug: 'alert',
  label: 'Top banner',
  admin: {
    group: 'Configuration',
    description: 'A bar at the top of all pages, e.g. for closing days or changed opening hours. Turn it off when it should not be shown.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Show the message',
      defaultValue: false,
    },
    {
      name: 'message',
      type: 'text',
      label: 'Message',
      maxLength: 160,
      admin: {
        description: 'Keep it short so it fits on one to two lines on mobile.',
        condition: (data) => Boolean(data?.enabled),
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: { enabled?: boolean } }) =>
        siblingData?.enabled && !value?.trim() ? 'Write a message, or turn off display.' : true,
    },
    {
      name: 'hasLink',
      type: 'checkbox',
      label: 'Add a link',
      defaultValue: false,
      admin: { condition: (data) => Boolean(data?.enabled) },
    },
    {
      ...(linkField as GroupField),
      admin: { condition: (data) => Boolean(data?.enabled && data?.hasLink) },
    },
  ],
}

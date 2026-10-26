import type { Block } from 'payload'

import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ThanksMessageBlock as ThanksMessageBlockProps } from '@/payload-types'

/** Kvittering efter en formular (Webflow: Section / Thanks for message): billede, stor overskrift og kort tekst, alt centreret i 896px. */
export const thanksMessageBlock: Block = {
  slug: 'thanksMessage',
  interfaceName: 'ThanksMessageBlock',
  labels: { singular: 'Tak-besked', plural: 'Tak-beskeder' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Billede',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Overskrift (H1)',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Tekst',
    },
  ],
}

export function ThanksMessage({ content, heading, image }: ThanksMessageBlockProps) {
  return (
    <section className="bg-background py-(--fluid-section)">
      <div className="site-container flex justify-center">
        <div className="flex w-full max-w-[896px] flex-col items-start gap-12">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(image)}
              alt={mediaAlt(image)}
              className="h-[320px] w-full rounded-2xl object-cover"
            />
          )}
          <h1 className="text-trim mt-5 mb-[10px] w-full text-center font-heading text-(length:--fluid-h1) leading-[1.3] font-light text-ink-800">
            {heading}
          </h1>
          {content && <RichText data={content} className="w-full text-center [&>:last-child]:mb-0" />}
        </div>
      </div>
    </section>
  )
}

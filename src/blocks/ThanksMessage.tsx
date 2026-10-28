import Image from 'next/image'
import type { Block } from 'payload'

import { RichText } from '@/components/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ThanksMessageBlock as ThanksMessageBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/** Kvittering efter en formular (Webflow: Section / Thanks for message): billede, stor overskrift og kort tekst, alt centreret i 896px. */
export const thanksMessageBlock: Block = {
  slug: 'thanksMessage',
  interfaceName: 'ThanksMessageBlock',
  labels: { singular: 'Thank-you message', plural: 'Thank-you messages' },
  fields: contentWithSpacingTabs('thanksMessage', [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading (H1)',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Text',
    },
  ]),
}

export function ThanksMessage({ content, heading, image }: ThanksMessageBlockProps) {
  return (
    <section className="bg-background py-(--fluid-section)">
      <div className="site-container flex justify-center">
        <div data-animate="fade-up" className="flex w-full max-w-[896px] flex-col items-start gap-12">
          {image && (
            <Image
              src={mediaUrl(image) ?? ''}
              alt={mediaAlt(image)}
              width={896}
              height={320}
              sizes="(min-width: 992px) 896px, 100vw"
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

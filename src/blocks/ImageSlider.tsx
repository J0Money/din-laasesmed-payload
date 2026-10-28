import type { Block } from 'payload'

import { Slider } from '@/components/Slider'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ImageSliderBlock as ImageSliderBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/** Billed-slider (Webflow: history_slider), fx "Vores historie": to billeder ad gangen på desktop, ét på mobil. */
export const imageSliderBlock: Block = {
  slug: 'imageSlider',
  interfaceName: 'ImageSliderBlock',
  labels: { singular: 'Image slider', plural: 'Image sliders' },
  fields: contentWithSpacingTabs('imageSlider', [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
      ],
    },
  ]),
}

export function ImageSlider({ images, title }: ImageSliderBlockProps) {
  return (
    <section className="overflow-hidden bg-white py-(--fluid-section)">
      <div className="site-container">
        {/* Som originalens Swiper: 1,2 billeder med 6px mellemrum, fra 996px 2 billeder med 24px. */}
        <Slider title={title} trackClassName="gap-1.5 min-[996px]:gap-6">
          {(images ?? []).map(({ id, image }) => (
            <li
              key={id}
              className="w-[calc((100%-1.2px)/1.2)] shrink-0 overflow-hidden rounded-2xl border border-[#ced5e1] bg-surface-form transition-[border-color,box-shadow] duration-200 hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] min-[996px]:w-[calc((100%-24px)/2)]"
            >
              <a href={mediaUrl(image)} className="block aspect-[3/2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(image)} alt={mediaAlt(image)} loading="lazy" className="h-full w-full object-cover" />
              </a>
            </li>
          ))}
        </Slider>
      </div>
    </section>
  )
}

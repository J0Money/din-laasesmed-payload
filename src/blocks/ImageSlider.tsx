import type { Block } from 'payload'

import { Slider } from '@/components/Slider'
import { mediaAlt, mediaUrl } from '@/lib/media'
import type { ImageSliderBlock as ImageSliderBlockProps } from '@/payload-types'

/** Billed-slider (Webflow: history_slider), fx "Vores historie": to billeder ad gangen på desktop, ét på mobil. */
export const imageSliderBlock: Block = {
  slug: 'imageSlider',
  interfaceName: 'ImageSliderBlock',
  labels: { singular: 'Billed-slider', plural: 'Billed-slidere' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Overskrift',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Billeder',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Billede',
        },
      ],
    },
  ],
}

export function ImageSlider({ images, title }: ImageSliderBlockProps) {
  return (
    <section className="overflow-hidden bg-white py-20">
      <div className="site-container">
        <Slider title={title} gap={24}>
          {(images ?? []).map(({ id, image }) => (
            <li
              key={id}
              className="w-full shrink-0 overflow-hidden rounded-2xl border border-[#ced5e1] bg-surface-form transition-[border-color,box-shadow] duration-200 hover:border-brand-500 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] min-[992px]:w-[calc((100%-24px)/2)]"
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

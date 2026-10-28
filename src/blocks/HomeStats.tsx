import type { Block } from 'payload'

import { PlusCircleIcon } from '@/components/home/HomeIcons'
import { ParallaxImage } from '@/components/home/ParallaxImage'
import { StatCounter } from '@/components/home/StatCounter'
import { mediaUrl } from '@/lib/media'
import type { HomeStatsBlock as HomeStatsBlockProps } from '@/payload-types'

/** Tal-bånd (Webflow: Section / Numbers): op til fire tal, der tæller op, over et parallax-billede. */
export const homeStatsBlock: Block = {
  slug: 'homeStats',
  interfaceName: 'HomeStatsBlock',
  labels: { singular: 'Stats band', plural: 'Stats bands' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Background image' },
    {
      name: 'items',
      type: 'array',
      label: 'Numbers',
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: 'value', type: 'number', required: true, label: 'Number' },
        { name: 'label', type: 'text', required: true, label: 'Text below the number' },
      ],
    },
  ],
}

export function HomeStats({ image, items }: HomeStatsBlockProps) {
  if (!items?.length) return null
  const imageUrl = mediaUrl(image, 'hero')

  return (
    <section className="relative overflow-hidden border-b-[0.8px] border-[#e4ebf3] bg-ink-900">
      {imageUrl && <ParallaxImage src={imageUrl} alt="" />}
      <div className="absolute inset-0 z-[1] bg-ink-900 opacity-80" />

      <div className="site-container relative z-10 flex flex-col items-center gap-(--fluid-gap-md) py-[60px] min-[768px]:grid min-[768px]:grid-cols-2 min-[768px]:gap-(--fluid-gap-lg) min-[768px]:py-(--fluid-pad) min-[992px]:flex min-[992px]:flex-row min-[992px]:items-center min-[992px]:justify-around">
        {items.map((stat) => (
          <div key={stat.id} data-animate="fade" className="flex w-1/2 flex-col items-center justify-center gap-3 text-center min-[768px]:w-auto min-[992px]:w-60">
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
  )
}

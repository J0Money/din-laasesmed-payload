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
  labels: { singular: 'Tal-bånd', plural: 'Tal-bånd' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Baggrundsbillede' },
    {
      name: 'items',
      type: 'array',
      label: 'Tal',
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: 'value', type: 'number', required: true, label: 'Tal' },
        { name: 'label', type: 'text', required: true, label: 'Tekst under tallet' },
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

      <div className="site-container relative z-10 grid grid-cols-2 gap-y-12 py-[112px] lg:flex lg:items-center lg:justify-around">
        {items.map((stat) => (
          <div key={stat.id} className="flex flex-col items-center justify-center gap-3 text-center lg:w-60">
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

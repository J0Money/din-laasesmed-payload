import type { Block } from 'payload'

import { mediaAlt, mediaUrl } from '@/lib/media'
import type { VideoHeroBlock as VideoHeroBlockProps } from '@/payload-types'

/** 453px videobånd (Webflow: Section / Video hero) øverst på kontakt-, Aalborg-, Om os- og Tranbjerg-siden. */
export const videoHeroBlock: Block = {
  slug: 'videoHero',
  interfaceName: 'VideoHeroBlock',
  labels: { singular: 'Video band', plural: 'Video bands' },
  fields: [
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Poster image',
      admin: { description: 'Shown while the video loads, and if it cannot be played.' },
    },
    {
      name: 'videoWebm',
      type: 'upload',
      relationTo: 'videos',
      label: 'Video (WebM)',
    },
    {
      name: 'videoMp4',
      type: 'upload',
      relationTo: 'videos',
      label: 'Video (MP4)',
      admin: { description: 'Used if the browser cannot play WebM (e.g. Safari).' },
    },
  ],
}

export function VideoHero({ poster, videoMp4, videoWebm }: VideoHeroBlockProps) {
  const webm = typeof videoWebm === 'object' ? videoWebm?.url : undefined
  const mp4 = typeof videoMp4 === 'object' ? videoMp4?.url : undefined

  return (
    <div className="relative aspect-[2.388/1] overflow-hidden min-[767px]:aspect-[3.5/1] bg-surface-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(poster)}
        alt={mediaAlt(poster)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {(webm || mp4) && (
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
      )}
    </div>
  )
}

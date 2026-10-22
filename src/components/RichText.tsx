import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { youtubeId } from '@/blocks/richtext/VideoEmbed'

type VideoEmbedFields = { title?: null | string; url: string }

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    videoEmbed: ({ node }: { node: { fields: VideoEmbedFields } }) => {
      const id = youtubeId(node.fields.url)
      if (!id) return null
      return (
        <figure className="rich-text-video">
          {/* youtube-nocookie sætter ingen sporings-cookies før afspilning (GDPR). */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={node.fields.title || 'Video'}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </figure>
      )
    },
  },
})

/** Fælles rich text-rendering med sitets typografi (.rich-text) og custom blocks. */
export function RichText({ data, className = '' }: { className?: string; data: unknown }) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <LexicalRichText data={data as any} converters={converters} className={`rich-text ${className}`} />
  )
}

import { randomBytes } from 'crypto'

const VIDEO_FIGURE = /<figure[^>]*w-richtext-figure-type-video[^>]*>[\s\S]*?<\/figure>/g
const MARKER = (index: number) => `@@WEBFLOW_VIDEO_${index}@@`

type Video = { title?: string; url: string }

/**
 * HTML→Lexical-konverteren smider <iframe> væk, så video-figurer erstattes af en
 * pladsholder-paragraf før konvertering og byttes til en videoEmbed-blok bagefter.
 */
export function extractVideos(html: string): { html: string; videos: Video[] } {
  const videos: Video[] = []
  const replaced = html.replace(VIDEO_FIGURE, (figure) => {
    const url =
      figure.match(/data-cookieblock-src="([^"]+)"/)?.[1] ?? figure.match(/\ssrc="([^"]+)"/)?.[1]
    if (!url) return ''
    const title = figure.match(/title="([^"]+)"/)?.[1]
    videos.push({ title, url })
    return `<p>${MARKER(videos.length - 1)}</p>`
  })
  return { html: replaced, videos }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LexicalNode = { children?: LexicalNode[]; text?: string; type: string; [key: string]: any }

export function injectVideoBlocks<T extends { root: LexicalNode }>(state: T, videos: Video[]): T {
  if (!videos.length) return state
  state.root.children = (state.root.children ?? []).map((node) => {
    const text = node.type === 'paragraph' ? (node.children ?? []).map((c) => c.text ?? '').join('') : ''
    const index = text.match(/^@@WEBFLOW_VIDEO_(\d+)@@$/)?.[1]
    if (index === undefined) return node
    const video = videos[Number(index)]
    return {
      type: 'block',
      version: 2,
      format: '',
      fields: {
        id: randomBytes(12).toString('hex'),
        blockName: '',
        blockType: 'videoEmbed',
        url: video.url,
        title: video.title ?? null,
      },
    }
  })
  return state
}

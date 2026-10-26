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

// Webflows "Embed" (div.w-embed): HTML-kode i selve teksten, fx en tabel med <style>. Konverteren flader den ud til afsnit.
const EMBED = /<div[^>]*class="[^"]*\bw-embed\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g
const EMBED_MARKER = (index: number) => `@@WEBFLOW_EMBED_${index}@@`

export function extractEmbeds(html: string): { embeds: string[]; html: string } {
  const embeds: string[] = []
  const replaced = html.replace(EMBED, (_, inner: string) => {
    embeds.push(inner.trim())
    return `<p>${EMBED_MARKER(embeds.length - 1)}</p>`
  })
  return { embeds, html: replaced }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LexicalNode = { children?: LexicalNode[]; text?: string; type: string; [key: string]: any }

export function injectEmbedBlocks<T extends { root: LexicalNode }>(state: T, embeds: string[]): T {
  if (!embeds.length) return state
  state.root.children = (state.root.children ?? []).map((node) => {
    const text = node.type === 'paragraph' ? (node.children ?? []).map((c) => c.text ?? '').join('') : ''
    const index = text.match(/^@@WEBFLOW_EMBED_(\d+)@@$/)?.[1]
    if (index === undefined) return node
    return {
      type: 'block',
      version: 2,
      format: '',
      fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType: 'htmlEmbed', html: embeds[Number(index)] },
    }
  })
  return state
}

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

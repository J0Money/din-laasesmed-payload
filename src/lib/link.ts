import { ROUTES } from './routes'

type LinkReference =
  | { relationTo: 'categories'; value: { slug: string } | string }
  | { relationTo: 'pages'; value: { slug: string } | string }
  | null
  | undefined

type LinkData = {
  label?: null | string
  newTab?: boolean | null
  reference?: LinkReference
  type?: 'custom' | 'reference' | null
  url?: null | string
} | null

export function resolveLinkHref(link: LinkData): string {
  if (!link) return '#'

  if (link.type === 'custom') return link.url || '#'

  const reference = link.reference
  if (!reference || typeof reference.value !== 'object') return '#'

  if (reference.relationTo === 'categories') return ROUTES.category(reference.value.slug)
  if (reference.relationTo === 'pages') return ROUTES.page(reference.value.slug)

  return '#'
}

/** Kategori-slug for et link, hvis det peger på en kategori — bruges til at vælge det rigtige nav-ikon. */
export function linkCategorySlug(link: LinkData): string | undefined {
  if (!link || link.type !== 'reference') return undefined
  const reference = link.reference
  if (reference?.relationTo === 'categories' && typeof reference.value === 'object') {
    return reference.value.slug
  }
  return undefined
}

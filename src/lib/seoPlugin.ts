import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import { HOME_PAGE_SLUG, ROUTES } from '@/lib/routes'

// Samme som SITE_URL i lib/seo.ts. Gentaget her, fordi lib/seo.ts henter fra Payload og ikke må importeres i konfigurationen.
const SITE_URL = (process.env.SITE_URL || 'https://din-laasesmed.dk').replace(/\/$/, '')

type SeoDoc = { mainHeading?: string; name?: string; slug?: string; title?: string }

/** "Generate"-knappen ved meta title: sidens navn efterfulgt af firmanavnet, som på originalen. */
export const generateTitle: GenerateTitle<SeoDoc> = ({ collectionSlug, doc }) => {
  const name = collectionSlug === 'articles' ? doc?.mainHeading : (doc?.name ?? doc?.title)
  return name ? `${name} | Din Låsesmed` : 'Din Låsesmed'
}

/** Adressen i Google-forhåndsvisningen. */
export const generateURL: GenerateURL<SeoDoc> = ({ collectionSlug, doc }) => {
  const slug = doc?.slug ?? ''
  switch (collectionSlug) {
    case 'articles':
      return SITE_URL + ROUTES.article(slug)
    case 'categories':
      return SITE_URL + ROUTES.category(slug)
    case 'brands':
      return SITE_URL + ROUTES.brand(slug)
    default:
      return SITE_URL + (slug === HOME_PAGE_SLUG ? ROUTES.home() : ROUTES.page(slug))
  }
}

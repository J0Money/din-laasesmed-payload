/**
 * Alle URL-stier for sitet samles her, så ingen komponent hardkoder en sti selv.
 */
export const ROUTES = {
  home: () => '/',
  article: (slug: string) => `/artikler/${slug}`,
  category: (slug: string) => `/overview/${slug}`,
  brand: (slug: string) => `/brands/${slug}`,
  employee: (slug: string) => `/employees/${slug}`,
  page: (slug: string) => `/${slug}`,
  contact: () => '/kontakt',
  contactAalborg: () => '/laasesmed-aalborg',
  notFound: () => '/404',
} as const

/** Slug på den Payload-side, der vises som forsiden på "/". Findes den ikke, bruges den faste forside. */
export const HOME_PAGE_SLUG = 'forside'

/**
 * Slugs der ikke må bruges som en Pages-slug, fordi de allerede er reserveret
 * af en af de faste ruter ovenfor.
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'artikler',
  'overview',
  'brands',
  'employees',
  'kvittering',
  '404',
]

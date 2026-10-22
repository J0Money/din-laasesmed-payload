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
  notFound: () => '/404',
} as const

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
  'kontakt',
  'kvittering',
  '404',
]

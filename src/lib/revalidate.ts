import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, Plugin } from 'payload'

import { bumpCmsCacheVersion, CMS_CACHE_TAG } from '@/lib/cacheTag'

// Det sitet viser. Indsendelser, brugere og MCP-nøgler er udeladt, så en formularindsendelse ikke rydder cachen.
const COLLECTIONS = ['pages', 'articles', 'categories', 'brands', 'employees', 'jobs', 'media', 'videos', 'forms']
const GLOBALS = ['header', 'footer', 'siteSettings', 'alert']

/**
 * Rydder al cachet indhold med det samme (ingen gammel udgave serveres). Versionen tælles altid op (virker også via MCP);
 * revalidateTag fjerner desuden de gamle udgaver. Udenfor Next.js (scripts, seed) er der ingen cache at rydde.
 */
function clearCache() {
  bumpCmsCacheVersion()
  try {
    revalidateTag(CMS_CACHE_TAG, { expire: 0 })
  } catch {
    // Kørt uden for en Next.js-forespørgsel.
  }
}

const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  clearCache()
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  clearCache()
  return doc
}

const afterGlobalChange: GlobalAfterChangeHook = ({ doc }) => {
  clearCache()
  return doc
}

/**
 * Når indhold gemmes, udgives, afpubliceres eller slettes i admin, ryddes cachen for hele sitet. Det er bevidst grovkornet:
 * ændringer er sjældne, og så kan en relation (fx en artikel vist i menuen og "læs også") aldrig blive glemt og vise gammelt indhold.
 * Skal være sidst i plugin-listen, så formularer fra form builder-pluginet allerede findes.
 */
export const revalidateCmsPlugin: Plugin = (incomingConfig) => ({
  ...incomingConfig,
  collections: (incomingConfig.collections ?? []).map((collection) =>
    COLLECTIONS.includes(collection.slug)
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
            afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
          },
        }
      : collection,
  ),
  globals: (incomingConfig.globals ?? []).map((global) =>
    GLOBALS.includes(global.slug)
      ? { ...global, hooks: { ...global.hooks, afterChange: [...(global.hooks?.afterChange ?? []), afterGlobalChange] } }
      : global,
  ),
})

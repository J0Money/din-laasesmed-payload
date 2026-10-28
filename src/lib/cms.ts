import { unstable_cache } from 'next/cache'
import type { Payload } from 'payload'

import { CMS_CACHE_TAG, cmsCacheVersion } from '@/lib/cacheTag'
import { getPayloadClient } from '@/lib/payload'

/**
 * Læsning fra Payload med cache. Resultatet gemmes, til indhold ændres i admin, så siderne ikke rammer databasen ved hvert besøg.
 * Sidernes HTML caches ikke (de er force-dynamic, fordi databasen ikke kan nås under build), kun data.
 * Bruges i stedet for getPayloadClient() overalt, hvor sitet læser indhold. Argumenterne og cache-versionen indgår i nøglen.
 */
export async function getCms() {
  const payload = await getPayloadClient()
  const key = (method: string, args: unknown) => ['cms', String(cmsCacheVersion()), method, JSON.stringify(args)]

  const find = ((args) =>
    unstable_cache(() => payload.find(args), key('find', args), { tags: [CMS_CACHE_TAG] })()) as Payload['find']

  const findByID = ((args) =>
    unstable_cache(() => payload.findByID(args), key('findByID', args), { tags: [CMS_CACHE_TAG] })()) as Payload['findByID']

  const findGlobal = ((args) =>
    unstable_cache(() => payload.findGlobal(args), key('findGlobal', args), { tags: [CMS_CACHE_TAG] })()) as Payload['findGlobal']

  return { find, findByID, findGlobal }
}

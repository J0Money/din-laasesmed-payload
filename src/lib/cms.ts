import { unstable_cache } from 'next/cache'
import type { Payload } from 'payload'

import { CMS_CACHE_TAG } from '@/lib/cacheTag'
import { getPayloadClient } from '@/lib/payload'

/**
 * Læsning fra Payload med cache. Resultatet gemmes, til indhold ændres i admin, så siderne ikke rammer databasen ved hvert besøg.
 * Sidernes HTML caches ikke (de er force-dynamic, fordi databasen ikke kan nås under build), kun data.
 * Bruges i stedet for getPayloadClient() overalt, hvor sitet læser indhold. Argumenterne indgår i cache-nøglen.
 */
export async function getCms() {
  const payload = await getPayloadClient()

  const find = ((args) =>
    unstable_cache(() => payload.find(args), ['cms', 'find', JSON.stringify(args)], { tags: [CMS_CACHE_TAG] })()) as Payload['find']

  const findByID = ((args) =>
    unstable_cache(() => payload.findByID(args), ['cms', 'findByID', JSON.stringify(args)], { tags: [CMS_CACHE_TAG] })()) as Payload['findByID']

  const findGlobal = ((args) =>
    unstable_cache(() => payload.findGlobal(args), ['cms', 'findGlobal', JSON.stringify(args)], { tags: [CMS_CACHE_TAG] })()) as Payload['findGlobal']

  return { find, findByID, findGlobal }
}

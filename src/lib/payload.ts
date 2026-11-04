import { getPayload } from 'payload'
import { cache } from 'react'

// Konfigurationen hentes først, når den skal bruges. Et fast import ville give en cirkel (config -> samlinger -> blokke ->
// komponenter -> cms -> payload -> config), og så kan en blok blive læst, før den er klar.
export const getPayloadClient = cache(async () => {
  const { default: config } = await import('@/payload.config')
  return getPayload({ config })
})

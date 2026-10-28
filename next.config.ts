import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 404-side til adresser uden matchende rute (der er flere root layouts: frontend og admin).
  experimental: { globalNotFound: true },
  // Alle andre adresser end det rigtige domæne (Railway-adressen, localhost) bedes holdt ude af søgemaskiner. Styres af den adresse
  // besøgende kommer ind på, så intet skal ændres ved domæneflytningen, og det rigtige domæne aldrig bliver blokeret ved en fejl.
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?!(www\\.)?din-laasesmed\\.dk$).*' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

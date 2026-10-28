import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 404-side til adresser uden matchende rute (der er flere root layouts: frontend og admin).
  experimental: { globalNotFound: true },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

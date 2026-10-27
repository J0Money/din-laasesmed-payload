import { SITE_URL } from '@/lib/seo'

// Samme indhold som originalens robots.txt (inkl. Content-Signal, som Next.js' robots.ts ikke kan skrive).
export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

Content-Signal: ai-train=no, search=yes, ai-input=no
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

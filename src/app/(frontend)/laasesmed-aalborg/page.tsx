import type { Metadata } from 'next'

import { DepartmentContactPage } from '@/components/contact/DepartmentContactPage'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Låsesmed Aalborg | Få hjælp hurtigt | +10.000 kunder | Døgnvagt',
  description:
    'Låsesmed i Aalborg med komplette sikringsløsninger under ét tag – fra rådgivning til installation og service. Erfarne montører, ISO‑certificeret kvalitet og døgnvagt klar til hurtig udrykning',
}

type LexicalNode = { children?: LexicalNode[]; text?: string; type?: string }

/** Importen gav artiklen et afsluttende "<p>‍</p>" (Webflow-pladsholder), som originalen ikke viser på siden. */
function withoutTrailingEmptyParagraphs(data: unknown) {
  const root = (data as { root?: LexicalNode } | null)?.root
  if (!root?.children) return data
  const children = [...root.children]
  const isEmpty = (n: LexicalNode) =>
    n.type === 'paragraph' && !(n.children ?? []).some((c) => (c.text ?? '').replace(/[\s​-‍]/g, ''))
  while (children.length && isEmpty(children[children.length - 1])) children.pop()
  return { ...(data as object), root: { ...root, children } }
}

/**
 * Aalborg-afdelingen; samme skabelon som /kontakt, men med Aalborgs nummer og adresse.
 * Brødteksten er artiklen "lasesmed-aalborg", hvis overskrift originalen viser som en h1 over teksten.
 * Topbjælkens nummer skifter til Aalborgs her, se CallLink.
 */
export default async function AalborgPage() {
  const payload = await getPayloadClient()
  const [siteSettings, articles] = await Promise.all([
    payload.findGlobal({ slug: 'siteSettings' }),
    payload.find({
      collection: 'articles',
      // Artiklen er bevidst en kladde, så den ikke også findes som /artikler/lasesmed-aalborg (dobbelt indhold).
      where: { slug: { equals: 'lasesmed-aalborg' } },
      limit: 1,
    }),
  ])
  const aalborg = siteSettings.departments?.[1]
  const article = articles.docs[0]

  return (
    <DepartmentContactPage
      phone={aalborg?.phone ?? siteSettings.phone ?? ''}
      address={aalborg?.address ?? ''}
      email={siteSettings.email ?? ''}
      heading="Kontakt os i dag"
    >
      {article && (
        <div className="w-full">
          <h1 className="text-trim mb-8 font-heading text-[48px] leading-[62.4px] font-light tracking-[-0.03em] text-ink-800">
            {article.mainHeading}
          </h1>
          <RichText data={withoutTrailingEmptyParagraphs(article.mainText)} className="[&>:last-child]:mb-0" />
        </div>
      )}
    </DepartmentContactPage>
  )
}

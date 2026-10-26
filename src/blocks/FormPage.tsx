import type { Block } from 'payload'

import { DynamicForm } from '@/components/forms/DynamicForm'
import { getPayloadClient } from '@/lib/payload'
import type { FormPageBlock as FormPageBlockProps } from '@/payload-types'

import { contentWithSpacingTabs } from './fields/layout'

/**
 * Formular i fuld bredde (Webflow: Form / Nøgler): overskrift og felter under hinanden i 1344px.
 * Felterne sættes sammen under Formularer, og de kan have "vis kun når", fx leveringsfelterne.
 */
export const formPageBlock: Block = {
  slug: 'formPage',
  interfaceName: 'FormPageBlock',
  labels: { singular: 'Formular-side', plural: 'Formular-sider' },
  fields: contentWithSpacingTabs('formPage', [
    { name: 'heading', type: 'text', required: true, label: 'Overskrift (H1)' },
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true, label: 'Formular' },
  ]),
}

export async function FormPage({ form, heading }: FormPageBlockProps) {
  const id = typeof form === 'string' ? form : form?.id
  if (!id) return null

  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'forms', id, depth: 1 }).catch(() => null)
  if (!doc) return null

  return (
    <section className="bg-background py-(--fluid-section)">
      <div className="site-container">
        <DynamicForm form={doc} variant="page" heading={heading} />
      </div>
    </section>
  )
}

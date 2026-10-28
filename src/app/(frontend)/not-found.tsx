import type { Metadata } from 'next'

import { NotFoundView } from '@/components/NotFoundView'

export const metadata: Metadata = { title: 'Siden findes ikke | Din Låsesmed' }

// Originalens 404 har hverken header eller footer, så siden lægges over layoutets header/footer.
export default function NotFound() {
  return (
    <div data-not-found className="fixed inset-0 z-[100] overflow-auto bg-background">
      <NotFoundView />
    </div>
  )
}

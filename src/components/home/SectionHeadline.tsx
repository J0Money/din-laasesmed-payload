/** Overskrift-par der går igen i forsidens sektioner: lille blå tagline + 40px let overskrift (h1 på originalen). */
export function SectionHeadline({
  tagline,
  title,
  center = false,
  leading = 'leading-[44px]',
}: {
  tagline: string
  title: string
  center?: boolean
  leading?: string
}) {
  return (
    <div className={`flex flex-col ${center ? 'items-center gap-3 text-center' : 'gap-2'}`}>
      <p className="font-heading text-sm leading-[21px] text-brand-500">{tagline}</p>
      <h2 className={`text-trim mt-5 mb-[10px] font-heading text-[40px] font-light text-ink-800 ${leading}`}>{title}</h2>
    </div>
  )
}

/** Knapper på forsiden har 16px tekst og ikon efter teksten, i modsætning til artiklernes 14px-knapper. */
export const HOME_BUTTON = 'h-auto gap-3 py-4 text-base'

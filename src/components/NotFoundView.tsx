import Link from 'next/link'

// Mål aflæst fra originalens 404-side: ingen header/footer, indhold centreret i et 416px bredt felt.
export function NotFoundView() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-[clamp(1rem,0.42857rem+2.857vw,3rem)]">
      <div className="w-full max-w-[416px] text-center">
        <div className="pt-5 pb-2.5">
          <div className="text-trim font-sans text-[length:clamp(40px,calc(40px+24*(100vw-320px)/1120),64px)] leading-[1.5] text-ink-muted">
            404
          </div>
        </div>
        <div className="mt-(--fluid-h2) pt-5">
          <h1 className="text-trim mb-[clamp(38px,calc(38px+3.2*(100vw-320px)/1120),41px)] font-heading text-(length:--fluid-h2) leading-none font-light text-ink-800">
            Er nøglerne væk?
          </h1>
          <p className="text-trim mb-(--fluid-gap) text-base leading-6 text-text-body">
            Vi kunne desværre ikke finde den side du forsøgte at besøge...
          </p>
          <Link href="/" className="button-accent !h-[50px] gap-3 !text-base">
            Gå til forsiden
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5h-3V9.5H6v4H3a.5.5 0 0 1-.5-.5V7Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  )
}

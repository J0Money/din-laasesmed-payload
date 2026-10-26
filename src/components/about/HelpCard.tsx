function PhoneIcon() {
  return (
    <svg viewBox="0 0 256 256" className="relative z-[1] w-7 shrink-0" aria-hidden>
      <path
        d="M164.39,145.34a8,8,0,0,1,7.59-.69l47.16,21.13a8,8,0,0,1,4.8,8.3A48.33,48.33,0,0,1,176,216,136,136,0,0,1,40,80,48.33,48.33,0,0,1,81.92,32.06a8,8,0,0,1,8.3,4.8l21.13,47.2a8,8,0,0,1-.66,7.53L89.32,117a7.93,7.93,0,0,0-.54,7.81c8.27,16.93,25.77,34.22,42.75,42.41a7.92,7.92,0,0,0,7.83-.59Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  )
}

/**
 * Mørkt "Har du brug for hjælp?"-kort, der står først i Administration og Aalborg på originalens Om os,
 * med udklippet af en montør nederst til højre (halvt gennemsigtigt under 992px).
 */
export function HelpCard({ phone }: { phone: string }) {
  return (
    <li className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-ink-900 px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="relative z-[1] flex flex-col gap-4">
        <h3 className="text-trim mt-5 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.1] font-light text-[#edf0f3]">
          Har du brug for hjælp?
        </h3>
        <p className="text-[#ced5e1]">Ring til os på</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/om-os/hjaelp-udklip.png"
        alt=""
        className="absolute right-0 bottom-0 max-w-[200px] object-contain opacity-50 min-[992px]:opacity-100"
      />
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="relative z-[1] flex items-center justify-center gap-3 rounded-lg border border-accent-red bg-accent-red px-6 py-4 font-heading text-xl leading-5 text-white transition-colors duration-200 hover:border-background hover:bg-background hover:text-ink-800"
      >
        <PhoneIcon />
        {phone}
      </a>
    </li>
  )
}

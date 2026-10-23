/** 453px videobånd fra butikken, som øverst på originalens kontakt-, Aalborg- og Om os-sider. */
export function ShopVideoHero() {
  return (
    <div className="relative h-[453px] overflow-hidden bg-surface-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/videos/butik-poster.avif" alt="Butik reception" className="absolute inset-0 h-full w-full object-cover" />
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/videos/butik.webm" type="video/webm" />
        <source src="/videos/butik.mp4" type="video/mp4" />
      </video>
    </div>
  )
}

// Kør på /laasesmed-aalborg (din-laasesmed.dk og localhost:3456) ved 1600px. Elementer findes via tekst.
;(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 2000))
  // Webflow IX efterlader inline translate(0, 20px)/opacity 0 på elementer der ikke er nået i mål.
  document.querySelectorAll('[class*="fade"], [style*="translate"], [style*="opacity: 0"]').forEach((e) => {
    e.style.opacity = 1
    e.style.transform = 'none'
  })

  const docRect = (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }
  }
  const pick = (el, props) => {
    const s = getComputedStyle(el)
    const o = {}
    for (const p of props) o[p] = p === 'fontFamily' ? s[p].split(',')[0].replace(/"/g, '') : s[p]
    return o
  }
  const TEXT = ['fontSize', 'lineHeight', 'fontWeight', 'fontFamily', 'color']
  const BOX = ['backgroundColor', 'borderRadius', 'borderTopColor']
  const m = (el, props = []) => (el ? { rect: docRect(el), ...pick(el, props) } : null)
  const leaf = (text) =>
    [...document.querySelectorAll('main *, .contact_cards *')].find(
      (el) =>
        ![...el.children].some((c) => c.textContent.trim()) &&
        el.textContent.trim().startsWith(text) &&
        el.getBoundingClientRect().width > 2,
    )
  const box = (el) => {
    let n = el
    while (n && getComputedStyle(n).backgroundColor === 'rgba(0, 0, 0, 0)') n = n.parentElement
    return n
  }
  const ringText = leaf('Ring til os når')
  const ringCta = leaf('2575 1297')
  const routeCta = leaf('Rutevejledning')
  const video = document.querySelector('video')

  window.__aalborgMeasure = JSON.stringify(
    {
      hero: m(video),
      card: m(box(ringText), [...BOX, 'boxShadow']),
      cardText: m(ringText, TEXT),
      cardIcon: m(ringText.previousElementSibling, BOX),
      filledCta: m(box(ringCta), BOX),
      filledCtaText: m(ringCta, TEXT),
      outlineCta: m(routeCta?.closest('a'), BOX),
      lastCardCta: m(leaf('ISO 9001')?.closest('a')),
      // Artikelbilledet (896px), ikke hero-posteren der også kan ligge i <main>.
      image: m(
        [...document.querySelectorAll('main img')].find((i) => Math.abs(i.getBoundingClientRect().width - 896) < 10),
        ['borderRadius'],
      ),
      heading: m(leaf('Kontakt os i dag'), TEXT),
      text: m(
        [...document.querySelectorAll('main p')].find((p) => p.closest('.rich-text, .w-richtext')),
        TEXT,
      ),
      richH1: m([...document.querySelectorAll('main h1')].find((h) => h.textContent.includes('Låseservice')), [...TEXT, 'letterSpacing', 'marginBottom']),
      topPhone: [...document.querySelectorAll('header a[href^="tel"], a[href^="tel"]')][0]?.textContent.trim(),
      formHeading: m(leaf('Brug for hjælp?'), TEXT),
      footerY: Math.round(document.querySelector('footer').getBoundingClientRect().top + scrollY),
    },
    null,
    2,
  )
})()


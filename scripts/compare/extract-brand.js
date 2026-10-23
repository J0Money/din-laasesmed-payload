// Kør på /brands/evva (din-laasesmed.dk og localhost:3456) ved 1600px. Elementer findes via tekst.
;(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
  document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'))
  await new Promise((r) => setTimeout(r, 2500))
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
  const m = (el, props = []) => (el ? { rect: docRect(el), ...pick(el, props) } : null)
  const leaf = (text) =>
    [...document.querySelectorAll('body *')].find(
      (el) =>
        !el.closest('header, nav, footer, [class*="mega"]') &&
        ![...el.children].some((c) => c.textContent.trim()) &&
        el.textContent.trim() === text &&
        el.getBoundingClientRect().width > 2,
    )
  const box = (el) => {
    let n = el
    while (n && getComputedStyle(n).backgroundColor === 'rgba(0, 0, 0, 0)') n = n.parentElement
    return n
  }
  const tagline = leaf('Mærke')
  const firstPreview = [...document.querySelectorAll('a[href^="/artikler/"]')].find(
    (a) => !a.closest('header, footer, nav, [class*="mega"]') && a.querySelector('img'),
  )
  const logo = [...document.querySelectorAll('img')].find((i) => /evva/i.test(i.getAttribute('src') || '') && Math.abs(i.getBoundingClientRect().width - 192) < 4)

  window.__brandMeasure = JSON.stringify(
    {
      intro: m(box(tagline), ['backgroundColor']),
      tagline: m(tagline, TEXT),
      name: m(leaf('EVVA'), TEXT),
      logo: m(logo),
      preview: m(firstPreview),
      previewTitle: m(firstPreview?.querySelector('h5, span'), TEXT),
      previewCount: [...document.querySelectorAll('a[href^="/artikler/"]')].filter((a) => !a.closest('header, footer, nav, [class*="mega"]') && a.querySelector('img')).length,
      image: m([...document.querySelectorAll('img')].find((i) => Math.abs(i.getBoundingClientRect().width - 896) < 10), ['borderRadius']),
      heading: m(leaf('EPS - Danmarks længste patent'), TEXT),
      firstH2: m([...document.querySelectorAll('h2')].find((h) => h.closest('.rich-text, .w-richtext')), TEXT),
      formHeading: m(leaf('Brug for hjælp?'), TEXT),
      sliderHeading: m(leaf('Alle mærker'), TEXT),
      slideCount: [...document.querySelectorAll('a[href^="/brands/"]')].filter((a) => !a.closest('header, footer, nav, [class*="mega"]')).length,
      footerY: Math.round(document.querySelector('footer').getBoundingClientRect().top + scrollY),
    },
    null,
    2,
  )
})()

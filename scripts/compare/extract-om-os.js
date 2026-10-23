// Kør på /om-os (din-laasesmed.dk og localhost:3456) ved 1600px. Elementer findes via tekst.
;(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
  document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'))
  await new Promise((r) => setTimeout(r, 2500))
  // Webflow IX efterlader inline transform/opacity på elementer, der ikke er nået i mål.
  document.querySelectorAll('[style*="transform"], [style*="opacity"]').forEach((e) => {
    if (e.closest('ul, .swiper-wrapper') && /translate3d/.test(e.style.transform)) return
    e.style.opacity = 1
    e.style.transform = 'none'
  })
  await new Promise((r) => setTimeout(r, 300))

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
  const leaf = (text, n = 0) =>
    [...document.querySelectorAll('body *')].filter(
      (el) =>
        !el.closest('header, nav, footer, [class*="mega"]') &&
        ![...el.children].some((c) => c.textContent.trim()) &&
        el.textContent.trim() === text &&
        el.getBoundingClientRect().width > 2,
    )[n]
  const card = (el) => {
    let n = el
    while (n && getComputedStyle(n).borderTopLeftRadius !== '16px') n = n.parentElement
    return n
  }
  const lastText = [...document.querySelectorAll('p')].find((p) => p.textContent.trim().startsWith('Vi lytter til dine behov'))
  const anders = leaf('Anders')

  window.__omOsMeasure = JSON.stringify(
    {
      image: m([...document.querySelectorAll('img')].find((i) => Math.abs(i.getBoundingClientRect().width - 896) < 10)),
      heading: m(leaf('Om Din Låsesmed'), TEXT),
      lastText: m(lastText, TEXT),
      formHeading: m(leaf('Brug for hjælp?')),
      motto: m(leaf('Din Låsesmed'), TEXT),
      mottoRight: m(leaf('Din tryghed')),
      administration: m(leaf('Administration'), TEXT),
      helpCard: m(card(leaf('Har du brug for hjælp?')), ['backgroundColor']),
      helpHeading: m(leaf('Har du brug for hjælp?'), TEXT),
      helpButton: m(leaf('Har du brug for hjælp?') && card(leaf('Har du brug for hjælp?')).querySelector('a[href^="tel"]')),
      personCard: m(card(anders), ['backgroundColor']),
      personImage: m(card(anders)?.querySelector('img')),
      personTitle: m(leaf('Daglig leder'), TEXT),
      personName: m(anders, TEXT),
      personMail: m([...card(anders).querySelectorAll('*')].find((e) => e.textContent.trim().startsWith('Skriv til') && !e.querySelector('a')), TEXT),
      montoerer: m(leaf('Montører')),
      aalborg: m(leaf('Aalborg')),
      lastCard: m(card(leaf('Malthe'))),
      history: m(leaf('Vores historie')),
      slide: m(card([...document.querySelectorAll('img')].find((i) => /0353|historie-1/.test(i.getAttribute('src') || '')))),
      footerY: Math.round(document.querySelector('footer').getBoundingClientRect().top + scrollY),
    },
    null,
    2,
  )
})()

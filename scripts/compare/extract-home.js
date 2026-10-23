// Kør på forsiden (din-laasesmed.dk og localhost:3456) ved 1600px bredde, efter at have scrollet siden igennem
// én gang så lazy-billeder og tællere er færdige. Elementer findes via deres tekst, så samme kode virker på begge sites.
;(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 150))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 2500))
  document.querySelectorAll('.u-fade-up,.u-fade-right').forEach((e) => {
    e.style.opacity = 1
    e.style.transform = 'none'
  })

  const docRect = (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }
  }
  const style = (el, props) => {
    const s = getComputedStyle(el)
    const out = {}
    for (const p of props) out[p] = p === 'fontFamily' ? s[p].split(',')[0].replace(/"/g, '') : s[p]
    return out
  }
  const TEXT = ['fontSize', 'lineHeight', 'fontWeight', 'fontFamily', 'color', 'fontStyle']
  const BOX = ['backgroundColor', 'borderRadius']

  // Blad-element med præcis denne tekst; minY skelner fx "Mekanisk sikring" i menuen fra fokus-kortet.
  function leaf(text, minY = 0) {
    return [...document.querySelectorAll('body *')].find((el) => {
      if (el.closest('header, footer, nav')) return false
      if ([...el.children].some((c) => c.textContent.trim())) return false
      const r = el.getBoundingClientRect()
      return el.textContent.trim() === text && r.width > 2 && r.height > 2 && r.top + scrollY >= minY
    })
  }
  const startsWith = (text) =>
    [...document.querySelectorAll('body *')].find(
      (el) => ![...el.children].some((c) => c.textContent.trim()) && el.textContent.trim().replace(/^"/, '').startsWith(text),
    )
  // Nærmeste forfader med synlig baggrund, dvs. selve knappen/boksen.
  function box(el) {
    let n = el
    while (n && getComputedStyle(n).backgroundColor === 'rgba(0, 0, 0, 0)') n = n.parentElement
    return n
  }
  function measure(el, props) {
    return el ? { rect: docRect(el), ...style(el, props) } : null
  }

  const visualBtn = leaf('Besøg os i Aarhus')
  const feature = leaf('Komplet løsning under ét tag.')
  const kunder = leaf('Kunder')

  const result = {
    heroTitle: measure(leaf('Din Låsesmed'), TEXT),
    heroBtnPrimary: measure(box(leaf('Gratis servicetjek')), [...BOX, 'paddingTop', 'paddingLeft']),
    heroBtnSecondary: measure(box(leaf('Kontakt os')), [...BOX, 'paddingTop', 'paddingLeft']),
    introTagline: measure(leaf('Din lokale låsesmed siden 1992'), TEXT),
    introTitle: measure(leaf('Den rette løsning'), TEXT),
    introFeatureTitle: measure(feature, TEXT),
    introIconBox: measure(feature?.parentElement?.previousElementSibling, BOX),
    introVisualBtn: measure(box(visualBtn), BOX),
    introVisualBtnText: measure(visualBtn, TEXT),
    testimonialsTitle: measure(leaf('Udtalelser'), TEXT),
    testimonialQuote: measure(startsWith('Vi sætter stor pris'), TEXT),
    testimonialAuthor: measure(leaf('Bent Høyer Laursen fra Aarbus'), TEXT),
    statsSection: measure(box(kunder), BOX),
    statLabel: measure(kunder, TEXT),
    statNumber: measure(kunder?.previousElementSibling?.firstElementChild || kunder?.previousElementSibling, TEXT),
    focusLabel: measure(leaf('Mekanisk sikring', 1500), TEXT),
    focusLabelBox: measure(box(leaf('Mekanisk sikring', 1500)), [...BOX, 'boxShadow']),
    focusDarkTitle: measure(leaf('Få et uforpligtende servicetjek'), TEXT),
    focusBtn: measure(box(leaf('Bestil service')), BOX),
    customersTagline: measure(leaf('Fra havedøren til havudsigt'), TEXT),
    customersTitle: measure(leaf('Mød vores erhvervskunder'), TEXT),
    customersSection: measure(box(leaf('Mød vores erhvervskunder')), BOX),
    customerLabel: measure(leaf('AArhus'), TEXT),
    pageHeight: document.body.scrollHeight,
  }
  window.__homeMeasure = JSON.stringify(result, null, 2)
  return 'done'
})()

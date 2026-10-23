// Kør på /overview/mekanisk-sikring (din-laasesmed.dk og localhost:3456) ved 1600px. Elementer findes via tekst/struktur.
;(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 2000))

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
    [...document.querySelectorAll('main *')].find(
      (el) => ![...el.children].some((c) => c.textContent.trim()) && el.textContent.trim() === text && el.getBoundingClientRect().width > 2,
    )
  const startsWith = (text) =>
    [...document.querySelectorAll('main *')].find(
      (el) => ![...el.children].some((c) => c.textContent.trim()) && el.textContent.trim().startsWith(text) && el.getBoundingClientRect().width > 2,
    )
  const box = (el) => {
    let n = el
    while (n && getComputedStyle(n).backgroundColor === 'rgba(0, 0, 0, 0)') n = n.parentElement
    return n
  }
  const tabs = [...document.querySelectorAll('main a[href*="/overview/"]')].filter((a) => a.getBoundingClientRect().width === 48)
  const firstTitle = leaf('Cylindere')
  const card = firstTitle.closest('li') || firstTitle.closest('.article_preview')
  const cardImg = card.querySelector('img')
  const secondTitle = leaf('Hængelåse')

  window.__overviewMeasure = JSON.stringify({
    tagline: m(leaf('Din lokale låsesmed siden 1992'), TEXT),
    name: m(leaf('Mekanisk sikring'), TEXT),
    introSection: m(box(leaf('Mekanisk sikring')), ['backgroundColor']),
    tabCurrent: m(tabs[0], ['backgroundColor', 'borderRadius', 'color']),
    tabOther: m(tabs[1], ['backgroundColor', 'borderRadius', 'color']),
    tabIcon: m(tabs[0]?.querySelector('svg')),
    mainHeading: m(startsWith('Tryghed i hverdagen'), TEXT),
    mainText: m(startsWith('Mekanisk sikring er grundstenen'), TEXT),
    cardImage: m(cardImg?.parentElement, ['borderRadius', 'backgroundColor']),
    cardTitle: m(firstTitle, TEXT),
    // Uddraget kan indeholde links, så det findes som <p> og ikke som blad-element.
    cardExcerpt: m(
      [...card.querySelectorAll('p')].find((p) => p.getBoundingClientRect().height > 0),
      TEXT,
    ),
    secondCardTitle: m(secondTitle),
    lastCardTitle: m(leaf('Vindueslåse')),
    brandsTitle: m(leaf('Alle mærker'), TEXT),
    pageHeight: document.body.scrollHeight,
  })
})()

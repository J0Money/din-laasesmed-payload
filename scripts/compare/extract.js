// Indsæt/kør denne i browserens konsol (eller via javascript_tool i Claude-browseren)
// på hhv. localhost:3456/artikler/<slug> og din-laasesmed.dk/artikler/<slug>,
// ved 1600px bredde. Kopiér output til scripts/compare/local.json hhv. live.json.
//
// Udvid listen "TARGETS" når vi skal tjekke andre sider end artikel-siden.

function cs(el) {
  return el ? getComputedStyle(el) : null
}
function rect(el) {
  return el ? el.getBoundingClientRect() : null
}
function pick(el, props) {
  if (!el) return null
  const s = cs(el)
  const r = rect(el)
  const out = { rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) } }
  for (const p of props) out[p] = s[p]
  return out
}

const imgs = [...document.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 100)
const heroImg = imgs.find((i) => getComputedStyle(i).filter !== 'none')
const mainImg = imgs.find((i) => i !== heroImg)
const heroBand = heroImg ? heroImg.parentElement : null
const h1 = document.querySelector('h1')

// "Overskrift før billedet" er en <h2> på originalen, men en <p> hos os (se kommentar i page.tsx) —
// find den derfor positionelt: størst skrift i zonen mellem hero-bånd og hovedbillede, ikke ved tagnavn.
// Hero-båndet ligger absolut og bag om indholdet, så zonen er fra dets TOP (= sektionens
// indholdsstart) til hovedbilledets top, ikke fra hero-båndets bund.
const zoneTop = heroBand ? heroBand.getBoundingClientRect().top : 0
const mainImgTop = mainImg ? mainImg.getBoundingClientRect().top : Infinity
const headingAboveImage = [...document.querySelectorAll('h1,h2,h3,p,div,span')]
  .filter((el) => el.children.length === 0 && el.textContent.trim().length > 2)
  .filter((el) => {
    const r = el.getBoundingClientRect()
    return r.top >= zoneTop && r.bottom <= mainImgTop + 5
  })
  .sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize))[0]

const ctaLink = [...document.querySelectorAll('a')].find((a) => a.textContent.trim().startsWith('Kontakt os'))
const ctaRow = ctaLink ? ctaLink.parentElement : null

JSON.stringify(
  {
    heroBand: pick(heroBand, ['opacity']),
    heroImg: pick(heroImg, ['opacity', 'filter', 'objectFit']),
    mainImg: pick(mainImg, ['borderRadius', 'boxShadow']),
    headingAboveImage: pick(headingAboveImage, ['fontSize', 'lineHeight', 'fontWeight', 'color']),
    h1: pick(h1, ['fontSize', 'lineHeight', 'fontWeight', 'color']),
    ctaRow: pick(ctaRow, []),
    ctaLink: pick(ctaLink, ['padding', 'borderRadius', 'backgroundColor']),
  },
  null,
  2,
)

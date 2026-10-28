/** Alle cachede læsninger har dette tag. Det ryddes, når noget gemmes, udgives eller slettes i admin (se lib/revalidate.ts). */
export const CMS_CACHE_TAG = 'cms'

// Versionen indgår i cache-nøglen og tælles op ved hver ændring, så gammel cache aldrig bruges. Det virker også, når
// revalidateTag ikke når at blive udført (ændringer via MCP: svaret er en strøm, og opdateringen kører efter forespørgslen).
// Ligger på globalThis, så admin-API'et og siderne deler den i samme proces. Starter ved processtart, så cache fra en
// tidligere kørsel ikke genbruges efter en genstart.
const store = globalThis as { __cmsCacheVersion?: number }

export function cmsCacheVersion(): number {
  store.__cmsCacheVersion ??= Date.now()
  return store.__cmsCacheVersion
}

export function bumpCmsCacheVersion(): void {
  store.__cmsCacheVersion = Math.max(Date.now(), cmsCacheVersion() + 1)
}

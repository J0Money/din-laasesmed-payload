'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NAV_ICON_BY_CATEGORY_SLUG } from './NavIcons'

type MobileMenuProps = {
  cta?: { href: string; label: string }
  links: { href: string; label: string }[]
  main: { href: string; iconSlug?: string; label: string }[]
}

/** Hamburger og venstre-skuffe under 992px (som originalens Webflow-nav, "medium"): 320px bred, glider ind over 0,4s. */
export function MobileMenu({ cta, links, main }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-[992px]:hidden">
      <button
        type="button"
        aria-label={open ? 'Luk menu' : 'Åbn menu'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`relative z-[101] flex h-[43.2px] w-12 items-center justify-center rounded-lg transition-colors duration-200 ${open ? 'bg-brand-500 text-white' : 'text-text-body'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} aria-hidden />}

      <nav
        aria-label="Menu"
        inert={!open}
        className={`fixed top-0 left-0 z-[100] h-dvh w-[320px] overflow-y-auto bg-surface-form p-[29.6px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-[transform,visibility] duration-[400ms] ${open ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <h4 className="text-trim mt-[10px] mb-[20.4px] font-heading text-xl leading-[30px] font-normal text-ink-800">Menu</h4>

        <ul className="flex flex-col gap-4 font-heading text-sm leading-5 font-medium">
          {main.map((item) => {
            const Icon = item.iconSlug ? NAV_ICON_BY_CATEGORY_SLUG[item.iconSlug] : undefined
            return (
              <li key={item.href + item.label}>
                <Link href={item.href} className="flex items-center gap-3 py-1 text-[14.4px]">
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.label}
                </Link>
              </li>
            )
          })}
          {links.map((item) => (
            <li key={item.href + item.label}>
              <Link href={item.href} className="flex py-1">
                {item.label}
              </Link>
            </li>
          ))}
          {cta && (
            <li>
              <Link href={cta.href} className="button w-full">
                {cta.label}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}

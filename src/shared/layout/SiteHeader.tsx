'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { site } from '@/content/site'

import { Logo } from './Logo'
import { FadeLink } from './PageTransition'

/** The page links in the header, left to right. "Say hi" is styled as a button, so it is added separately. */
const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/bench', label: 'Bench' },
  { href: '/projects', label: 'Projects' },
  { href: '/notebook', label: 'Notebook' },
]

/**
 * Keeps the CSS variable `--header-h` equal to the header's real height, so the
 * home page hero can fill exactly the rest of the screen.
 */
function usePublishHeaderHeight(headerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const publishHeight = () =>
      document.documentElement.style.setProperty('--header-h', `${header.getBoundingClientRect().height}px`)
    const observer = new ResizeObserver(publishHeight)
    observer.observe(header)
    publishHeight()
    return () => observer.disconnect()
  }, [headerRef])
}

export function SiteHeader() {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  usePublishHeaderHeight(headerRef)

  // A link counts as current on its own page and on any page under it (/projects and /projects/cubli).
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header ref={headerRef} className="border-b-[1.5px] border-line bg-paper">
      <nav
        aria-label="Main"
        className="mono mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-1 px-3.5 text-xs font-bold"
      >
        <FadeLink
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className="flex items-center gap-2.5 px-2.5 py-3.5 no-underline hover:underline hover:underline-offset-4"
        >
          <Logo size={32} />
          <span>{site.byline}</span>
        </FadeLink>
        <div className="flex flex-wrap items-center">
          {NAV_LINKS.map((item) => {
            const current = isCurrent(item.href)
            return (
              <FadeLink
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`px-2.5 py-3.5 underline-offset-4 hover:underline ${current ? 'underline decoration-2' : 'no-underline'}`}
              >
                {item.label}
              </FadeLink>
            )
          })}
          <FadeLink
            href="/say-hi"
            aria-current={isCurrent('/say-hi') ? 'page' : undefined}
            className="ml-1.5 rounded-md bg-ink px-3.5 py-2 text-butter no-underline hover:text-white"
          >
            Say hi
          </FadeLink>
        </div>
      </nav>
    </header>
  )
}

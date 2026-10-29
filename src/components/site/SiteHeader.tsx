'use client'

import { usePathname } from 'next/navigation'

import { site } from '@/content/site'

import { Logo } from './Logo'
import { FadeLink } from './PageTransition'

const NAV = [
  { href: '/about', label: 'About' },
  { href: '/bench', label: 'Bench' },
  { href: '/projects', label: 'Projects' },
  { href: '/notebook', label: 'Notebook' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="border-b-[1.5px] border-line bg-paper">
      <nav
        aria-label="Main"
        className="mono mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-1 px-3.5 text-xs font-bold"
      >
        <FadeLink
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className="flex items-center gap-2.5 px-2.5 py-3.5 no-underline hover:underline hover:underline-offset-4"
        >
          <Logo />
          <span>{site.byline}</span>
        </FadeLink>
        <div className="flex flex-wrap items-center">
          {NAV.map((item) => {
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

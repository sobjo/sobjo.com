'use client'

import { usePathname } from 'next/navigation'

import { site } from '@/content/site'

import { Logo } from './Logo'
import { FadeLink } from './PageTransition'

export function SiteFooter() {
  const pathname = usePathname()
  const onHome = pathname === '/'

  return (
    <footer className="bg-ink text-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-6 py-9">
        <div className="flex items-center gap-3.5">
          <Logo size={44} withTape />
          <div className="flex flex-col gap-1">
            <span className="hl text-[26px] text-white">{site.name}</span>
            <span className="mono text-[10px] text-steel">{site.tagline}</span>
          </div>
        </div>
        <nav aria-label="Footer" className="mono flex flex-wrap gap-[18px] text-[11px] font-bold">
          <a href={site.links.github} className="py-2.5 text-line underline">
            GitHub
          </a>
          <a href={site.links.linkedin} className="py-2.5 text-line underline">
            LinkedIn
          </a>
          {onHome ? (
            <FadeLink href="/say-hi" className="py-2.5 text-butter underline">
              Say hi →
            </FadeLink>
          ) : (
            <FadeLink href="/" className="py-2.5 text-line underline">
              Back to the line ↑
            </FadeLink>
          )}
        </nav>
      </div>
    </footer>
  )
}

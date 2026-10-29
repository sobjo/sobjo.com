'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps } from 'react'

const LEAVE_MS = 380

type Navigate = (href: string) => void

const TransitionContext = createContext<Navigate | null>(null)

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Fades the page out before an internal navigation and back in on arrival,
 * like the static mockups did with their `leaving` class.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  // Remember which page we are leaving; once the path changes the cover lifts by itself.
  const [leavingFrom, setLeavingFrom] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const navigate = useCallback<Navigate>(
    (href) => {
      const target = new URL(href, window.location.href)
      const samePage = target.pathname === window.location.pathname
      if (samePage || prefersReducedMotion()) {
        router.push(href)
        return
      }
      setLeavingFrom(window.location.pathname)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => router.push(href), LEAVE_MS)
    },
    [router],
  )

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div className="page-fade" data-leaving={leavingFrom === pathname} aria-hidden="true" />
    </TransitionContext.Provider>
  )
}

export function usePageTransition(): Navigate {
  const navigate = useContext(TransitionContext)
  const router = useRouter()
  return navigate ?? router.push
}

/** A next/link that plays the page fade. Modified clicks and new tabs behave normally. */
export function FadeLink({ href, onClick, target, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const navigate = usePageTransition()
  return (
    <Link
      href={href}
      target={target}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || target || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (!href.startsWith('/')) return
        e.preventDefault()
        navigate(href)
      }}
      {...props}
    />
  )
}

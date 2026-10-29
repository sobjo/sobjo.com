import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'

import { PageTransitionProvider } from '@/components/site/PageTransition'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { site } from '@/content/site'

import './globals.css'

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : undefined,
  title: { default: `${site.name} · Home`, template: `${site.name} · %s` },
  description: site.description,
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body className="m-0 bg-paper font-sans text-ink antialiased">
        <PageTransitionProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </PageTransitionProvider>
        <Analytics />
      </body>
    </html>
  )
}

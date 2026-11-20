import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'

import '../(site)/globals.css'

/*
 * The private pages (just /update-site for now). Same fonts and colors as the
 * public site, but no site header or footer, and hidden from search engines.
 */

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SOBJO · Update the site',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body className="dots m-0 min-h-screen font-sans text-ink antialiased">{children}</body>
    </html>
  )
}

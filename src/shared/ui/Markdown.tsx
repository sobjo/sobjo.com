/* eslint-disable @next/next/no-img-element -- photos in a write-up have no known size, so a plain img fits best */
import type { ReactNode } from 'react'

/*
 * Renders the Markdown written in the /update-site editor (project write-ups and
 * notebook entries) with the site's `.richtext` styles. It understands the
 * everyday bits and nothing more:
 *
 *   # Heading, ## Heading, ### Smaller heading
 *   **bold**, *italic*, `code`, [a link](https://…)
 *   - bullet lists and 1. numbered lists
 *   > a quote
 *   ![a photo](/uploads/notebook/photo.jpg) on its own line
 *   ``` code blocks ```
 *   --- a divider
 *
 * It never renders raw HTML, so whatever is typed can't break the page.
 */

export function Markdown({
  text,
  className = 'richtext',
  imageSrc,
}: {
  text: string
  className?: string
  /** Lets the editor's preview swap in photos that aren't on the site yet. */
  imageSrc?: (url: string) => string
}) {
  return <div className={className}>{blocks(text, imageSrc)}</div>
}

/** Links may only go to web pages, email, or somewhere on this site. */
function safeHref(url: string) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? url : null
}

function blocks(text: string, imageSrc?: (url: string) => string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const out: ReactNode[] = []
  let i = 0
  const key = () => out.length

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // ``` code block ```
    if (line.trim().startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++])
      i++
      out.push(
        <pre key={key()}>
          <code>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const content = inline(heading[2].replace(/\s+#+\s*$/, ''))
      if (level <= 2) out.push(<h2 key={key()}>{content}</h2>)
      else if (level === 3) out.push(<h3 key={key()}>{content}</h3>)
      else out.push(<h4 key={key()}>{content}</h4>)
      i++
      continue
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push(<hr key={key()} />)
      i++
      continue
    }

    const picture = /^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line)
    if (picture) {
      const src = safeHref(picture[2])
      if (src)
        out.push(
          <figure key={key()} className="m-0">
            <img src={imageSrc?.(src) ?? src} alt={picture[1]} loading="lazy" className="h-auto w-full rounded-lg border-[1.5px] border-line" />
            {picture[1] && <figcaption className="mono mt-2 text-[10px] text-muted">{picture[1]}</figcaption>}
          </figure>,
        )
      i++
      continue
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''))
      out.push(<blockquote key={key()}>{blocks(quote.join('\n'), imageSrc)}</blockquote>)
      continue
    }

    const bullet = /^\s*[-*+]\s+/
    const numbered = /^\s*\d+[.)]\s+/
    if (bullet.test(line) || numbered.test(line)) {
      const pattern = bullet.test(line) ? bullet : numbered
      const items: string[] = []
      while (i < lines.length && lines[i].trim()) {
        if (pattern.test(lines[i])) items.push(lines[i].replace(pattern, ''))
        else if (/^\s+/.test(lines[i]) && items.length) items[items.length - 1] += ' ' + lines[i].trim()
        else break
        i++
      }
      const children = items.map((item, n) => <li key={n}>{inline(item)}</li>)
      out.push(pattern === bullet ? <ul key={key()}>{children}</ul> : <ol key={key()}>{children}</ol>)
      continue
    }

    // A paragraph runs until a blank line or the start of another kind of block.
    const paragraph: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*>|\s*```|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[i])
    )
      paragraph.push(lines[i++].trim())
    if (paragraph.length === 0) paragraph.push(lines[i++].trim())
    out.push(<p key={key()}>{inline(paragraph.join(' '))}</p>)
  }

  return out
}

/** Bold, italic, code and links inside a line. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|__(.+?)__|\*([^*\s][^*]*?)\*|(?<!\w)_([^_\s][^_]*?)_(?!\w)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const [whole, code, label, url, bold1, bold2, em1, em2] = match
    const k = out.length
    if (code != null) out.push(<code key={k}>{code}</code>)
    else if (label != null) {
      const href = safeHref(url)
      const external = href?.startsWith('http')
      out.push(
        href ? (
          <a key={k} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {inline(label)}
          </a>
        ) : (
          whole
        ),
      )
    } else if (bold1 != null || bold2 != null) out.push(<strong key={k}>{inline(bold1 ?? bold2)}</strong>)
    else out.push(<em key={k}>{inline(em1 ?? em2)}</em>)
    last = match.index + whole.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

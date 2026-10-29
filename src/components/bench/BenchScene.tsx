'use client'

import { useMemo } from 'react'

import { buildBench, type Pin } from './bench-scene'
import { useBench } from './BenchContext'

const LABEL =
  'Isometric corner of the workshop: a long workbench holding a bench power supply, a soldering station, a 3D printer, an oscilloscope and a computer, each marked with a numbered pin, under a shelf of parts bins, with a pegboard on the side wall and a stool in front.'

export function BenchScene({ pins }: { pins: Pin[] }) {
  const { active } = useBench()
  const { shapes, labels } = useMemo(() => buildBench(active, pins), [active, pins])

  return (
    <svg
      viewBox="0 0 640 440"
      role="img"
      aria-label={LABEL}
      className="block h-auto max-w-[680px] min-w-0 flex-[1_1_560px]"
    >
      <defs>
        <filter id="sb-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id="sb-cs" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse cx="320" cy="420" rx="240" ry="18" fill="#1C2128" opacity="0.16" filter="url(#sb-blur)" />
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill}
          stroke={s.stroke ?? 'none'}
          strokeWidth={s.strokeWidth ?? 0}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={s.opacity}
          filter={s.filter}
        />
      ))}
      {labels.map((t) => (
        <text
          key={t.text}
          x={t.x}
          y={t.y}
          className="mono"
          fontSize={t.size}
          fontWeight={700}
          fill={t.fill}
          textAnchor="middle"
        >
          {t.text}
        </text>
      ))}
    </svg>
  )
}

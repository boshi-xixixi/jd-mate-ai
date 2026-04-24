'use client'

import type { RadarDataPoint } from '@/lib/types'

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
}

export function RadarChart({ data, size = 300 }: RadarChartProps) {
  const center = size / 2
  const radius = size * 0.35
  const levels = 4
  const angleStep = (2 * Math.PI) / data.length

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const gridPaths = Array.from({ length: levels }, (_, level) => {
    const r = radius * ((level + 1) / levels)
    return Array.from({ length: data.length }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ') + ' Z'
  })

  const axisLines = data.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2
    return {
      x1: center,
      y1: center,
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
    }
  })

  const dataPoints = data.map((d, i) => getPoint(i, d.score))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.7 0.18 270)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.65 0.15 200)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="oklch(0.3 0.01 270)"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="oklch(0.3 0.01 270)"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        <path d={dataPath} fill="url(#radarGrad)" stroke="oklch(0.7 0.18 270)" strokeWidth="2" filter="url(#glow)" />

        {dataPoints.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="oklch(0.7 0.18 270)" filter="url(#glow)" />
            <circle cx={p.x} cy={p.y} r="2" fill="oklch(0.95 0 0)" />
          </g>
        ))}

        {data.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2
          const labelR = radius + 24
          const x = center + labelR * Math.cos(angle)
          const y = center + labelR * Math.sin(angle)
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="11"
              fontWeight="500"
            >
              {d.skill}
            </text>
          )
        })}

        {Array.from({ length: levels }, (_, i) => {
          const value = ((i + 1) / levels) * 100
          return (
            <text
              key={i}
              x={center + 4}
              y={center - radius * ((i + 1) / levels) + 4}
              className="fill-muted-foreground/50"
              fontSize="9"
            >
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

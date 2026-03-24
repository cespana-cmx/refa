'use client'

interface RadarDataPoint {
  label: string
  value: number
  maxValue?: number
  color?: string
}

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
  const center = size / 2
  const radius = size * 0.38
  const levels = 5
  const total = data.length

  if (total === 0) return null

  // Calculate polygon points for a level
  const getPolygonPoints = (levelRadius: number): string => {
    return data
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2
        const x = center + levelRadius * Math.cos(angle)
        const y = center + levelRadius * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Calculate data polygon points
  const getDataPoints = (): string => {
    return data
      .map((d, i) => {
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2
        const max = d.maxValue || 5
        const r = radius * ((d.value - 1) / (max - 1))
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Get label position
  const getLabelPos = (i: number) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    const labelRadius = radius + 36
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    }
  }

  // Get axis endpoint
  const getAxisEnd = (i: number) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#534AB7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5DCAA5" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Level polygons */}
        {Array.from({ length: levels }).map((_, lvl) => {
          const levelRadius = (radius * (lvl + 1)) / levels
          return (
            <polygon
              key={lvl}
              points={getPolygonPoints(levelRadius)}
              fill="none"
              stroke="rgba(83, 74, 183, 0.2)"
              strokeWidth={1}
            />
          )
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const end = getAxisEnd(i)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="rgba(83, 74, 183, 0.25)"
              strokeWidth={1}
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={getDataPoints()}
          fill="url(#radarGradient)"
          stroke="#534AB7"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points dots */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / total - Math.PI / 2
          const max = d.maxValue || 5
          const r = radius * ((d.value - 1) / (max - 1))
          const x = center + r * Math.cos(angle)
          const y = center + r * Math.sin(angle)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={5} fill="#534AB7" stroke="#AFA9EC" strokeWidth={2} />
            </g>
          )
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const pos = getLabelPos(i)
          const textAnchor =
            Math.abs(pos.x - center) < 5 ? 'middle' : pos.x < center ? 'end' : 'start'

          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight="600"
                fill="#AFA9EC"
                fontFamily="Inter, sans-serif"
              >
                {d.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 9}
                textAnchor={textAnchor}
                fontSize="13"
                fontWeight="700"
                fill="#E8E6FF"
                fontFamily="Inter, sans-serif"
              >
                {d.value.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Center dot */}
        <circle cx={center} cy={center} r={3} fill="rgba(83, 74, 183, 0.4)" />
      </svg>
    </div>
  )
}

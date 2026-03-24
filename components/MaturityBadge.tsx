import { MaturityLevel, getMaturityInfo } from '@/lib/scoring'

interface MaturityBadgeProps {
  level: MaturityLevel
  score?: number
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
}

export default function MaturityBadge({
  level,
  score,
  size = 'md',
  showScore = false,
}: MaturityBadgeProps) {
  const info = getMaturityInfo(score || 1)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        background: info.bgColor,
        color: info.color,
        border: `1px solid ${info.color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: info.color }}
      />
      {info.label}
      {showScore && score !== undefined && (
        <span className="opacity-75 ml-1">({score.toFixed(1)})</span>
      )}
    </span>
  )
}

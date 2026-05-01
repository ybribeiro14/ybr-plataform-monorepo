interface ModuleProgressProps {
  percent: number
}

const ModuleProgress = ({ percent }: ModuleProgressProps) => {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

export type { ModuleProgressProps }
export { ModuleProgress }

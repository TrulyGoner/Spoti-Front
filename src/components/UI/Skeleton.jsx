export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-surface-700 rounded-lg animate-pulse ${className}`}
      role="status"
      aria-label="Загрузка..."
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}


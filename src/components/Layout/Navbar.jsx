import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-surface-800 border-b border-surface-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-400">
            SoundSphere
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded transition-colors ${
                isActive('/') ? 'bg-primary-500 text-white' : 'text-surface-300 hover:text-white'
              }`}
            >
              Поиск
            </Link>
            <Link
              to="/playlists"
              className={`px-3 py-2 rounded transition-colors ${
                isActive('/playlists') ? 'bg-primary-500 text-white' : 'text-surface-300 hover:text-white'
              }`}
            >
              Плейлисты
            </Link>
            <Link
              to="/statistics"
              className={`px-3 py-2 rounded transition-colors ${
                isActive('/statistics') ? 'bg-primary-500 text-white' : 'text-surface-300 hover:text-white'
              }`}
            >
              Статистика
            </Link>
            <Link
              to="/recommendations"
              className={`px-3 py-2 rounded transition-colors ${
                isActive('/recommendations') ? 'bg-primary-500 text-white' : 'text-surface-300 hover:text-white'
              }`}
            >
              Рекомендации
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}


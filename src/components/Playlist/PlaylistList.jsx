import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Skeleton from '../UI/Skeleton'

export default function PlaylistList() {
  const playlists = useSelector(state => state.playlists.items)
  const loading = useSelector(state => state.playlists.loading)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-surface-400">
          У вас пока нет плейлистов. Создайте первый!
        </div>
        <Link to="/playlists/new" className="block text-center">
          <button className="btn-primary">Создать плейлист</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Мои плейлисты</h1>
        <Link to="/playlists/new">
          <button className="btn-primary">+ Создать плейлист</button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map(playlist => (
          <Link
            key={playlist.id}
            to={`/playlists/${playlist.id}`}
            className="card hover:bg-surface-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">{playlist.name}</h3>
            <p className="text-surface-400 text-sm mb-2">
              {playlist.description || 'Без описания'}
            </p>
            <p className="text-surface-500 text-xs">
              Треков: {playlist.tracks?.length || 0}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

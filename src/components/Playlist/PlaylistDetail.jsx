import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { removeTrackFromPlaylist, updatePlaylist } from '../../store/slices/playlistsSlice'
import { dbService } from '../../services/indexedDB'
import TrackCard from '../Track/TrackCard'
import Skeleton from '../UI/Skeleton'

export default function PlaylistDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const playlist = useSelector(state =>
    state.playlists.items.find(p => p.id === id)
  )

  if (!playlist) {
    return (
      <div className="text-center py-8 text-surface-400">
        Плейлист не найден
      </div>
    )
  }

  const handleRemoveTrack = async (trackId) => {
    dispatch(removeTrackFromPlaylist({ playlistId: id, trackId }))
    const updatedPlaylist = {
      ...playlist,
      tracks: playlist.tracks.filter(t => t.id !== trackId),
    }
    await dbService.savePlaylist(updatedPlaylist)
  }

  return (
    <div>
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-2">{playlist.name}</h1>
        <p className="text-surface-400 mb-4">
          {playlist.description || 'Без описания'}
        </p>
        <p className="text-surface-500 text-sm">
          Треков: {playlist.tracks?.length || 0}
        </p>
      </div>

      {playlist.tracks?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlist.tracks.map(track => (
            <div key={track.id} className="relative">
              <TrackCard track={track} />
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                title="Удалить из плейлиста"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-surface-400">
          Плейлист пуст. Добавьте треки из поиска!
        </div>
      )}
    </div>
  )
}


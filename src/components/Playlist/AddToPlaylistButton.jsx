import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTrackToPlaylist } from '../../store/slices/playlistsSlice'
import { dbService } from '../../services/indexedDB'

export default function AddToPlaylistButton({ track }) {
  const [isOpen, setIsOpen] = useState(false)
  const playlists = useSelector(state => state.playlists.items)
  const dispatch = useDispatch()

  const handleAddToPlaylist = async (playlistId) => {
    dispatch(addTrackToPlaylist({ playlistId, track }))
    const playlist = playlists.find(p => p.id === playlistId)
    if (playlist) {
      const updatedPlaylist = {
        ...playlist,
        tracks: [...(playlist.tracks || []), track],
      }
      await dbService.savePlaylist(updatedPlaylist)
    }
    setIsOpen(false)
  }

  if (playlists.length === 0) {
    return (
      <span className="text-xs text-surface-400">
        Создайте плейлист, чтобы добавить треки
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary text-sm"
      >
        + В плейлист
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-surface-800 border border-surface-700 rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              <p className="text-xs text-surface-400 mb-2 px-2">Выберите плейлист:</p>
              {playlists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full text-left px-2 py-1 hover:bg-surface-700 rounded text-sm"
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


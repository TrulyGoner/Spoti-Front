import { useDispatch, useSelector } from 'react-redux'
import { setRating, addTag, removeTag } from '../../store/slices/tracksSlice'
import { incrementPlayCount } from '../../store/slices/statisticsSlice'
import { dbService } from '../../services/indexedDB'
import RatingStars from './RatingStars'
import TagInput from './TagInput'
import AddToPlaylistButton from '../Playlist/AddToPlaylistButton'

export default function TrackCard({ track }) {
  const dispatch = useDispatch()
  const rating = useSelector(state => state.tracks.ratings[track.id] || 0)
  const tags = useSelector(state => state.tracks.tags[track.id] || [])
  const playCount = useSelector(state => state.statistics.playCounts[track.id] || 0)

  const handleRatingChange = async (newRating) => {
    dispatch(setRating({ trackId: track.id, rating: newRating }))
    await dbService.saveRating(track.id, newRating)
  }

  const handlePlay = async () => {
    dispatch(incrementPlayCount(track.id))
    const stats = await dbService.getStatistics(track.id)
    const newPlayCount = (stats?.playCount || 0) + 1
    await dbService.saveStatistics(track.id, {
      playCount: newPlayCount,
      lastPlayed: new Date().toISOString(),
    })
    if (track.previewUrl) {
      const audio = new Audio(track.previewUrl)
      audio.play().catch(err => console.error('Playback error:', err))
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="card">
      {track.albumImage && (
        <img
          src={track.albumImage}
          alt={track.album}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <h3 className="text-lg font-semibold mb-1">{track.name}</h3>
      <p className="text-surface-400 text-sm mb-2">{track.artists}</p>
      <p className="text-surface-500 text-xs mb-3">{track.album}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-surface-400 text-xs">{formatDuration(track.duration)}</span>
        {playCount > 0 && (
          <span className="text-surface-400 text-xs">Прослушано: {playCount}</span>
        )}
      </div>

      <div className="mb-3">
        <RatingStars
          rating={rating}
          onRatingChange={handleRatingChange}
        />
      </div>

      <TagInput
        trackId={track.id}
        tags={tags}
        onAddTag={(tag) => {
          dispatch(addTag({ trackId: track.id, tag }))
          dbService.getTags(track.id).then(currentTags => {
            dbService.saveTags(track.id, [...currentTags, tag])
          })
        }}
        onRemoveTag={(tag) => {
          dispatch(removeTag({ trackId: track.id, tag }))
          dbService.getTags(track.id).then(currentTags => {
            dbService.saveTags(track.id, currentTags.filter(t => t !== tag))
          })
        }}
      />

      <div className="flex gap-2 mt-3">
        {track.previewUrl && (
          <button onClick={handlePlay} className="btn-primary flex-1 text-sm">
            ▶ Прослушать
          </button>
        )}
        {track.externalUrl && (
          <a
            href={track.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1 text-sm text-center"
          >
            Открыть в Spotify
          </a>
        )}
      </div>
      <div className="mt-2">
        <AddToPlaylistButton track={track} />
      </div>
    </div>
  )
}


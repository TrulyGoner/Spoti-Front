import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useMemo } from 'react'
import { setTopTracks, setTopArtists } from '../../store/slices/statisticsSlice'

export default function StatisticsDashboard() {
  const dispatch = useDispatch()
  const playCounts = useSelector(state => state.statistics.playCounts)
  const totalPlays = useSelector(state => state.statistics.totalPlays)
  const tracks = useSelector(state => state.tracks.items)
  const ratings = useSelector(state => state.tracks.ratings)

  const topTracks = useMemo(() => {
    return Object.entries(playCounts)
      .map(([trackId, count]) => {
        const track = tracks.find(t => t.id === trackId)
        return track ? { ...track, playCount: count } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10)
  }, [playCounts, tracks])

  const topArtists = useMemo(() => {
    const artistCounts = {}
    Object.entries(playCounts).forEach(([trackId, count]) => {
      const track = tracks.find(t => t.id === trackId)
      if (track) {
        track.artists.split(', ').forEach(artist => {
          artistCounts[artist] = (artistCounts[artist] || 0) + count
        })
      }
    })
    return Object.entries(artistCounts)
      .map(([artist, count]) => ({ artist, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [playCounts, tracks])

  const averageRating = useMemo(() => {
    const ratedTracks = Object.values(ratings).filter(r => r > 0)
    if (ratedTracks.length === 0) return 0
    return (ratedTracks.reduce((sum, r) => sum + r, 0) / ratedTracks.length).toFixed(1)
  }, [ratings])

  useEffect(() => {
    dispatch(setTopTracks(topTracks))
    dispatch(setTopArtists(topArtists))
  }, [topTracks, topArtists, dispatch])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-surface-400 mb-1">Всего прослушиваний</h3>
          <p className="text-3xl font-bold">{totalPlays}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-surface-400 mb-1">Уникальных треков</h3>
          <p className="text-3xl font-bold">{tracks.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-surface-400 mb-1">Средний рейтинг</h3>
          <p className="text-3xl font-bold">{averageRating}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Топ-10 треков</h2>
          {topTracks.length > 0 ? (
            <div className="space-y-2">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 bg-surface-700 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-surface-400 w-6">{index + 1}</span>
                    <div>
                      <p className="font-medium">{track.name}</p>
                      <p className="text-sm text-surface-400">{track.artists}</p>
                    </div>
                  </div>
                  <span className="text-surface-400">{track.playCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400">Нет данных</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Топ-10 исполнителей</h2>
          {topArtists.length > 0 ? (
            <div className="space-y-2">
              {topArtists.map((item, index) => (
                <div
                  key={item.artist}
                  className="flex items-center justify-between p-2 bg-surface-700 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-surface-400 w-6">{index + 1}</span>
                    <p className="font-medium">{item.artist}</p>
                  </div>
                  <span className="text-surface-400">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  )
}


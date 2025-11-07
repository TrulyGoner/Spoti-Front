import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import TrackCard from '../Track/TrackCard'

export default function Recommendations() {
  const tracks = useSelector(state => state.tracks.items)
  const ratings = useSelector(state => state.tracks.ratings)
  const playCounts = useSelector(state => state.statistics.playCounts)
  const tags = useSelector(state => state.tracks.tags)

  const recommendations = useMemo(() => {


    const scoredTracks = tracks.map(track => {
      let score = 0

      const rating = ratings[track.id] || 0
      score += rating * 10

      const plays = playCounts[track.id] || 0
      score += Math.min(plays * 2, 30)

      const trackTags = tags[track.id] || []
      score += trackTags.length * 5

      return { ...track, score }
    })

    return scoredTracks
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [tracks, ratings, playCounts, tags])

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-surface-400">
        <p className="mb-2">Нет рекомендаций</p>
        <p className="text-sm">Добавьте треки, оцените их и прослушайте несколько раз</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Рекомендации для вас</h2>
      <p className="text-surface-400 mb-6">
        На основе ваших оценок, прослушиваний и тегов
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(track => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  )
}


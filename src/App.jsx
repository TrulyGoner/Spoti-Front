import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTracks, setRating, setTags } from './store/slices/tracksSlice'
import { setPlaylists } from './store/slices/playlistsSlice'
import { setPlayCount } from './store/slices/statisticsSlice'
import { dbService } from './services/indexedDB'
import Navbar from './components/Layout/Navbar'
import SearchBar from './components/Search/SearchBar'
import PlaylistList from './components/Playlist/PlaylistList'
import PlaylistForm from './components/Playlist/PlaylistForm'
import PlaylistDetail from './components/Playlist/PlaylistDetail'
import StatisticsDashboard from './components/Statistics/StatisticsDashboard'
import Recommendations from './components/Recommendations/Recommendations'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Загружаем данные из IndexedDB при старте приложения
    const loadOfflineData = async () => {
      try {
        const [tracks, playlists, ratings, tags, statistics] = await Promise.all([
          dbService.getAllTracks(),
          dbService.getAllPlaylists(),
          dbService.getAllRatings(),
          dbService.getAllTags(),
          dbService.getAllStatistics(),
        ])

        dispatch(setTracks(tracks))
        dispatch(setPlaylists(playlists))

        // Восстанавливаем рейтинги
        ratings.forEach(({ trackId, rating }) => {
          dispatch(setRating({ trackId, rating }))
        })

        // Восстанавливаем теги
        tags.forEach(({ trackId, tags: trackTags }) => {
          dispatch(setTags({ trackId, tags: trackTags }))
        })

        // Восстанавливаем статистику
        statistics.forEach((stat) => {
          if (stat.playCount) {
            dispatch(setPlayCount({ trackId: stat.trackId, count: stat.playCount }))
          }
        })
      } catch (error) {
        console.error('Error loading offline data:', error)
      }
    }

    loadOfflineData()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchBar />} />
          <Route path="/playlists" element={<PlaylistList />} />
          <Route path="/playlists/new" element={<PlaylistForm />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/statistics" element={<StatisticsDashboard />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </main>
    </div>
  )
}

export default App


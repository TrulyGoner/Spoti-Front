import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appendResults,
  setError,
  setFilters,
  setHasMore,
  setLoading,
  setPage,
  setPreferences,
  setPreferencesError,
  setQuery,
  setResults,
  setGeneratedTags,
  setTagLoading,
} from '../../store/slices/searchSlice'
import { addTrack } from '../../store/slices/tracksSlice'
import { spotifyAPI, mockSpotifyAPI } from '../../services/spotifyAPI'
import { dbService } from '../../services/indexedDB'
import { BASELINE_TAGS, generateTags, POPULAR_TITLES } from '../../services/tagGenerator'
import TrackCard from '../Track/TrackCard'
import Skeleton from '../UI/Skeleton'

const GENRE_OPTIONS = [
  { value: '', label: 'Любой жанр' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'orchestral', label: 'Orchestral' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'folk', label: 'Folk' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'metal', label: 'Metal' },
  { value: 'hip-hop', label: 'Hip-hop' },
  { value: 'classical', label: 'Classical' },
]

const YEAR_OPTIONS = [
  { value: '', label: 'Любой год' },
  { value: '1960', label: 'с 1960' },
  { value: '1970', label: 'с 1970' },
  { value: '1980', label: 'с 1980' },
  { value: '1990', label: 'с 1990' },
  { value: '2000', label: 'с 2000' },
  { value: '2010', label: 'с 2010' },
  { value: '2020', label: 'с 2020' },
]

const YEAR_TO_OPTIONS = [
  { value: '', label: 'До любого года' },
  { value: '1970', label: 'до 1970' },
  { value: '1980', label: 'до 1980' },
  { value: '1990', label: 'до 1990' },
  { value: '2000', label: 'до 2000' },
  { value: '2010', label: 'до 2010' },
  { value: '2020', label: 'до 2020' },
  { value: '2030', label: 'до 2030' },
]

function MiniPlayer({ track, isPlaying, onTogglePlay, onPrev, onNext, hasPrev, hasNext }) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      {track?.albumImage ? (
        <img
          src={track.albumImage}
          alt={track.album || track.name}
          className="w-full sm:w-32 h-32 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full sm:w-32 h-32 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 text-sm">
          Нет обложки
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-surface-400 mb-1">Мини-проигрыватель</p>
        <h3 className="text-lg font-semibold truncate">{track ? track.name : 'Нет трека'}</h3>
        <p className="text-surface-400 text-sm truncate">
          {track ? track.artists : 'Выберите предпочтения, чтобы начать' }
        </p>
        {!track?.previewUrl && (
          <p className="text-xs text-surface-500 mt-2">
            Для выбранного трека нет 30-секундного превью, выберите другой.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary px-3"
          onClick={onPrev}
          disabled={!hasPrev}
        >
          Prev
        </button>
        <button
          type="button"
          className="btn-primary px-4"
          onClick={onTogglePlay}
          disabled={!track?.previewUrl}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="btn-secondary px-3"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default function SearchBar() {
  const dispatch = useDispatch()
  const {
    results,
    loading,
    error,
    preferences,
    preferencesError,
    generatedTags,
    tagLoading,
    tagSource,
    filters,
    page,
    hasMore,
  } = useSelector(state => state.search)

  const [searchQuery, setSearchQuery] = useState('')
  const [preferencesInput, setPreferencesInput] = useState(preferences)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [playerIndex, setPlayerIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    setPreferencesInput(preferences)
  }, [preferences])

  const validatePreferences = useCallback((value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Введите названия игр или фильмов через запятую'
    if (trimmed.length < 2) return 'Минимальная длина ввода — 2 символа'
    if (trimmed.length > 500) return 'Максимальная длина ввода — 500 символов'
    return null
  }, [])

  const tokenisedPreferences = useMemo(() =>
    preferencesInput
      .split(',')
      .map(part => part.trim())
      .filter(Boolean),
  [preferencesInput])

  const currentToken = useMemo(() => {
    const parts = preferencesInput.split(',')
    return parts[parts.length - 1]?.trim() || ''
  }, [preferencesInput])

  const suggestions = useMemo(() => {
    const limit = 6
    if (!preferencesInput) {
      return POPULAR_TITLES.slice(0, limit)
    }

    const currentLower = currentToken.toLocaleLowerCase()

    return POPULAR_TITLES.filter(title => {
      const titleLower = title.toLocaleLowerCase()
      if (currentLower && !titleLower.includes(currentLower)) {
        return false
      }
      return !tokenisedPreferences.some(token => token.toLocaleLowerCase() === titleLower)
    }).slice(0, limit)
  }, [currentToken, preferencesInput, tokenisedPreferences])

  const getNextPlayableIndex = useCallback((startIndex, direction) => {
    if (!results.length) return null

    let index = startIndex
    for (let i = 0; i < results.length; i += 1) {
      index = (index + direction + results.length) % results.length
      const candidate = results[index]
      if (candidate?.previewUrl) {
        return index
      }
    }

    return null
  }, [results])

  const handlePreferencesChange = (value) => {
    setPreferencesInput(value)
    dispatch(setPreferences(value))
    dispatch(setPreferencesError(null))
  }

  const persistTracks = useCallback((tracks) => {
    tracks.forEach(track => {
      dbService.saveTrack(track)
      dispatch(addTrack(track))
    })
  }, [dispatch])

  const performTagSearch = useCallback(async ({
    tagData,
    pageToLoad,
    overrideFilters,
    replace,
  }) => {
    if (!tagData) return
    dispatch(setLoading(true))
    dispatch(setError(null))
    const filtersToUse = overrideFilters || filters

    try {
      const token = await spotifyAPI.getAccessToken()

      if (!token) {
        const mockResults = await mockSpotifyAPI.searchTracksByTags(tagData, {
          page: pageToLoad,
          filters: filtersToUse,
        })
        if (replace) {
          dispatch(setResults(mockResults.items))
        } else {
          dispatch(appendResults(mockResults.items))
        }
        dispatch(setHasMore(mockResults.hasMore))
        dispatch(setPage(pageToLoad))
        persistTracks(mockResults.items)
        return
      }

      const searchResult = await spotifyAPI.searchTracksByTags(tagData, {
        page: pageToLoad,
        filters: filtersToUse,
      })

      if (replace) {
        dispatch(setResults(searchResult.items))
      } else {
        dispatch(appendResults(searchResult.items))
      }
      dispatch(setHasMore(searchResult.hasMore))
      dispatch(setPage(pageToLoad))
      persistTracks(searchResult.items)
    } catch (err) {
      dispatch(setError(err.message))
    } finally {
      dispatch(setLoading(false))
    }
  }, [appendResults, dispatch, filters, persistTracks])

  useEffect(() => {
    if (!generatedTags && !loading) {
      dispatch(setGeneratedTags({ data: BASELINE_TAGS, source: 'baseline' }))
      performTagSearch({
        tagData: BASELINE_TAGS,
        pageToLoad: 0,
        overrideFilters: filters,
        replace: true,
      })
    }
  }, [generatedTags, loading, dispatch, performTagSearch, filters])

  const handleGenerateTags = useCallback(async (rawValue) => {
    const sourceValue = typeof rawValue === 'string' ? rawValue : preferencesInput
    const trimmed = sourceValue
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .join(', ')

    const validationError = validatePreferences(trimmed)
    if (validationError) {
      dispatch(setPreferencesError(validationError))
      return
    }

    dispatch(setPreferences(trimmed))
    dispatch(setPreferencesError(null))
    dispatch(setTagLoading(true))

    try {
      const tagPayload = await generateTags(trimmed)
      dispatch(setGeneratedTags(tagPayload))
      await performTagSearch({
        tagData: tagPayload.data,
        pageToLoad: 0,
        overrideFilters: filters,
        replace: true,
      })
    } catch (err) {
      dispatch(setPreferencesError(err.message || 'Не удалось сгенерировать теги'))
    } finally {
      dispatch(setTagLoading(false))
    }
  }, [dispatch, filters, performTagSearch, preferencesInput, validatePreferences])

  const handleSuggestionSelect = (suggestion) => {
    const parts = preferencesInput.split(',')
    parts[parts.length - 1] = ` ${suggestion}`
    const nextValue = parts
      .map(part => part.trim())
      .filter(Boolean)
      .join(', ')
    setPreferencesInput(nextValue)
    dispatch(setPreferences(nextValue))
    dispatch(setPreferencesError(null))
    setShowSuggestions(false)
    handleGenerateTags(nextValue)
  }

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters))
  }

  const [newFiltersBuffer, setNewFiltersBuffer] = useState(filters)

  useEffect(() => {
    setNewFiltersBuffer(filters)
  }, [filters])

  const handleFilterInputChange = (key, value) => {
    const next = {
      ...newFiltersBuffer,
      [key]: value,
    }
    setNewFiltersBuffer(next)
    handleFilterChange(next)
    if (generatedTags) {
      performTagSearch({
        tagData: generatedTags,
        pageToLoad: 0,
        overrideFilters: next,
        replace: true,
      })
    }
  }

  const handleApplyFilters = () => {
    handleFilterChange(newFiltersBuffer)
    if (generatedTags) {
      performTagSearch({
        tagData: generatedTags,
        pageToLoad: 0,
        overrideFilters: newFiltersBuffer,
        replace: true,
      })
    }
  }

  const handleLoadMore = () => {
    if (!generatedTags || loading) return
    performTagSearch({
      tagData: generatedTags,
      pageToLoad: page + 1,
      overrideFilters: filters,
      replace: false,
    })
  }

  useEffect(() => {
    if (!results.length) {
      setPlayerIndex(null)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    if (playerIndex !== null) {
      const current = results[playerIndex]
      if (current && current.previewUrl) {
        return
      }
    }

    const firstPlayable = results.findIndex(track => track.previewUrl)
    setPlayerIndex(firstPlayable !== -1 ? firstPlayable : null)
    setIsPlaying(false)
  }, [results, playerIndex])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (playerIndex === null) {
      return
    }

    const track = results[playerIndex]
    if (!track || !track.previewUrl) {
      return
    }

    const audio = new Audio(track.previewUrl)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    setIsPlaying(false)

    return () => {
      audio.pause()
    }
  }, [playerIndex, results])

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const handleTogglePlay = () => {
    const track = playerIndex !== null ? results[playerIndex] : null
    if (!track || !track.previewUrl) {
      return
    }
    setIsPlaying(prev => !prev)
  }

  const handleNextTrack = useCallback(() => {
    const baseIndex = playerIndex !== null ? playerIndex : -1
    const nextIndex = getNextPlayableIndex(baseIndex, 1)
    if (nextIndex !== null) {
      setPlayerIndex(nextIndex)
    }
  }, [getNextPlayableIndex, playerIndex])

  const handlePrevTrack = useCallback(() => {
    const baseIndex = playerIndex !== null ? playerIndex : 0
    const prevIndex = getNextPlayableIndex(baseIndex, -1)
    if (prevIndex !== null) {
      setPlayerIndex(prevIndex)
    }
  }, [getNextPlayableIndex, playerIndex])

  const currentTrack = playerIndex !== null && results[playerIndex] ? results[playerIndex] : null

  const hasNext = useMemo(() => {
    if (!results.length) return false
    const baseIndex = playerIndex !== null ? playerIndex : -1
    return getNextPlayableIndex(baseIndex, 1) !== null
  }, [getNextPlayableIndex, playerIndex, results.length])

  const hasPrev = useMemo(() => {
    if (!results.length) return false
    const baseIndex = playerIndex !== null ? playerIndex : 0
    return getNextPlayableIndex(baseIndex, -1) !== null
  }, [getNextPlayableIndex, playerIndex, results.length])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    dispatch(setQuery(searchQuery))
    dispatch(setLoading(true))
    dispatch(setError(null))
    dispatch(setGeneratedTags(null))
    dispatch(setHasMore(false))
    dispatch(setPage(0))

    try {
      let tracks
      const token = await spotifyAPI.getAccessToken()
      if (token) {
        try {
          tracks = await spotifyAPI.searchTracks(searchQuery)
        } catch (apiError) {
          console.warn('Spotify API error, using mock:', apiError.message)
          tracks = await mockSpotifyAPI.searchTracks(searchQuery)
        }
      } else {
        // Если токен не установлен, сразу используем mock данные
        console.log('Using mock API (Spotify token not configured)')
        tracks = await mockSpotifyAPI.searchTracks(searchQuery)
      }

      dispatch(setResults(tracks))
      
      // Сохраняем треки в IndexedDB для офлайн режима
      tracks.forEach(track => {
        dbService.saveTrack(track)
        dispatch(addTrack(track))
      })
    } catch (err) {
      dispatch(setError(err.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Поиск по предпочтениям</h2>
        <p className="text-surface-400 text-sm mb-3">
          Введите названия игр и фильмов через запятую. Мы сгенерируем музыкальные теги и подберём треки.
        </p>
        <div className="relative">
          <textarea
            value={preferencesInput}
            onChange={(e) => handlePreferencesChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Например: Ведьмак 3, Blade Runner 2049, La La Land"
            className="input w-full min-h-[96px] resize-y"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full max-h-48 overflow-auto rounded-lg border border-surface-700 bg-surface-800 shadow-lg">
              {suggestions.map(suggestion => (
                <li
                  key={suggestion}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSuggestionSelect(suggestion)
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-surface-700"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        {preferencesError && (
          <p className="text-red-400 text-sm mt-2">{preferencesError}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleGenerateTags()}
            disabled={tagLoading}
          >
            {tagLoading ? 'Генерация...' : 'Сгенерировать теги'}
          </button>
          {tagSource && (
            <span className="text-xs text-surface-400">
              Источник: {tagSource === 'huggingface' ? 'Hugging Face API' : 'Резервная система'}
            </span>
          )}
        </div>
      </section>

      <MiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">2.1.3. Поиск в Spotify</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <select
            className="input"
            value={newFiltersBuffer.popularity}
            onChange={(e) => handleFilterInputChange('popularity', e.target.value)}
          >
            <option value="any">Любая популярность</option>
            <option value="high">Высокая (&gt;= 70)</option>
            <option value="medium">Средняя (40-69)</option>
            <option value="low">Низкая (&lt; 40)</option>
          </select>
          <select
            className="input"
            value={newFiltersBuffer.yearFrom}
            onChange={(e) => handleFilterInputChange('yearFrom', e.target.value)}
          >
            {YEAR_OPTIONS.map(option => (
              <option key={option.value || 'any-start'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={newFiltersBuffer.yearTo}
            onChange={(e) => handleFilterInputChange('yearTo', e.target.value)}
          >
            {YEAR_TO_OPTIONS.map(option => (
              <option key={option.value || 'any-end'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={newFiltersBuffer.genre}
            onChange={(e) => handleFilterInputChange('genre', e.target.value)}
          >
            {GENRE_OPTIONS.map(option => (
              <option key={option.value || 'any-genre'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleApplyFilters}
            disabled={!generatedTags || loading}
          >
            Применить фильтры
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const defaults = {
                popularity: 'any',
                genre: '',
                yearFrom: '',
                yearTo: '',
              }
              setNewFiltersBuffer(defaults)
              dispatch(setFilters(defaults))
              if (generatedTags) {
                performTagSearch({
                  tagData: generatedTags,
                  pageToLoad: 0,
                  overrideFilters: defaults,
                  replace: true,
                })
              }
            }}
            disabled={!generatedTags || loading}
          >
            Сбросить фильтры
          </button>
        </div>
      </section>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск треков на Spotify..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Поиск...' : 'Найти'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">Ошибка: {error}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(track => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}

      {!loading && !error && results.length > 0 && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLoadMore}
            disabled={loading}
          >
            Загрузить ещё
          </button>
        </div>
      )}

      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-8 text-surface-400">
          Ничего не найдено
        </div>
      )}
    </div>
  )
}


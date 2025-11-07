import { SPOTIFY_CONFIG } from '../config/spotify'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const RESULTS_PER_PAGE = 20

let accessToken = null
let tokenExpiryTime = null

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const MOCK_TRACKS = [
  {
    id: '1',
    name: 'Bohemian Rhapsody',
    artists: 'Queen',
    artistGenres: ['classic rock', 'progressive rock'],
    album: 'A Night at the Opera',
    albumImage: 'https://via.placeholder.com/300',
    duration: 355000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1',
    spotifyId: '1',
    popularity: 85,
    releaseYear: 1975,
  },
  {
    id: '2',
    name: 'Stairway to Heaven',
    artists: 'Led Zeppelin',
    artistGenres: ['hard rock', 'classic rock'],
    album: 'Led Zeppelin IV',
    albumImage: 'https://via.placeholder.com/300',
    duration: 482000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/2',
    spotifyId: '2',
    popularity: 80,
    releaseYear: 1971,
  },
  {
    id: '3',
    name: 'Hotel California',
    artists: 'Eagles',
    artistGenres: ['soft rock', 'country rock'],
    album: 'Hotel California',
    albumImage: 'https://via.placeholder.com/300',
    duration: 391000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/3',
    spotifyId: '3',
    popularity: 78,
    releaseYear: 1976,
  },
  {
    id: '4',
    name: 'Imagine',
    artists: 'John Lennon',
    artistGenres: ['soft rock', 'singer-songwriter'],
    album: 'Imagine',
    albumImage: 'https://via.placeholder.com/300',
    duration: 183000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/4',
    spotifyId: '4',
    popularity: 76,
    releaseYear: 1971,
  },
  {
    id: '5',
    name: 'Billie Jean',
    artists: 'Michael Jackson',
    artistGenres: ['pop', 'funk'],
    album: 'Thriller',
    albumImage: 'https://via.placeholder.com/300',
    duration: 294000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/5',
    spotifyId: '5',
    popularity: 90,
    releaseYear: 1982,
  },
  {
    id: '6',
    name: "Sweet Child O' Mine",
    artists: "Guns N' Roses",
    artistGenres: ['hard rock', 'glam metal'],
    album: 'Appetite for Destruction',
    albumImage: 'https://via.placeholder.com/300',
    duration: 356000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/6',
    spotifyId: '6',
    popularity: 82,
    releaseYear: 1987,
  },
  {
    id: '7',
    name: 'Smells Like Teen Spirit',
    artists: 'Nirvana',
    artistGenres: ['grunge', 'alternative rock'],
    album: 'Nevermind',
    albumImage: 'https://via.placeholder.com/300',
    duration: 301000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/7',
    spotifyId: '7',
    popularity: 88,
    releaseYear: 1991,
  },
  {
    id: '8',
    name: 'Like a Rolling Stone',
    artists: 'Bob Dylan',
    artistGenres: ['folk rock', 'classic rock'],
    album: 'Highway 61 Revisited',
    albumImage: 'https://via.placeholder.com/300',
    duration: 366000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/8',
    spotifyId: '8',
    popularity: 74,
    releaseYear: 1965,
  },
  {
    id: '9',
    name: 'Hey Jude',
    artists: 'The Beatles',
    artistGenres: ['british invasion', 'pop rock'],
    album: 'The Beatles',
    albumImage: 'https://via.placeholder.com/300',
    duration: 425000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/9',
    spotifyId: '9',
    popularity: 83,
    releaseYear: 1968,
  },
  {
    id: '10',
    name: 'Purple Rain',
    artists: 'Prince',
    artistGenres: ['pop rock', 'funk'],
    album: 'Purple Rain',
    albumImage: 'https://via.placeholder.com/300',
    duration: 512000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/10',
    spotifyId: '10',
    popularity: 81,
    releaseYear: 1984,
  },
  {
    id: '11',
    name: 'Thunderstruck',
    artists: 'AC/DC',
    artistGenres: ['hard rock'],
    album: 'The Razors Edge',
    albumImage: 'https://via.placeholder.com/300',
    duration: 292000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/11',
    spotifyId: '11',
    popularity: 77,
    releaseYear: 1990,
  },
  {
    id: '12',
    name: 'Wonderwall',
    artists: 'Oasis',
    artistGenres: ['britpop', 'alternative rock'],
    album: "(What's the Story) Morning Glory?",
    albumImage: 'https://via.placeholder.com/300',
    duration: 258000,
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/12',
    spotifyId: '12',
    popularity: 79,
    releaseYear: 1995,
  },
]

function sanitizeTerm(term) {
  return term.replace(/["\\]/g, '').slice(0, 40)
}

function extractYear(dateString) {
  if (!dateString) return null
  const match = dateString.match(/\d{4}/)
  if (!match) return null
  const year = Number(match[0])
  return Number.isFinite(year) ? year : null
}

function mapSpotifyTrack(track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(artist => artist.name).join(', '),
    artistIds: track.artists.map(artist => artist.id).filter(Boolean),
    album: track.album?.name || '',
    albumImage: track.album?.images?.[0]?.url || null,
    duration: track.duration_ms,
    previewUrl: track.preview_url,
    externalUrl: track.external_urls?.spotify,
    spotifyId: track.id,
    popularity: typeof track.popularity === 'number' ? track.popularity : null,
    releaseYear: extractYear(track.album?.release_date),
  }
}

function convertEraToYearRange(era) {
  if (!era) return null
  const rangeMatch = era.match(/(\d{4})\D+(\d{4})/)
  if (rangeMatch) {
    const start = Number(rangeMatch[1])
    const end = Number(rangeMatch[2])
    if (start && end && end >= start) {
      return `${start}-${end}`
    }
  }

  const decadeMatch = era.match(/(\d{4})s/)
  if (decadeMatch) {
    const start = Number(decadeMatch[1])
    if (start) {
      return `${start}-${start + 9}`
    }
  }

  const yearMatch = era.match(/(\d{4})/)
  if (yearMatch) {
    const year = Number(yearMatch[1])
    if (year) {
      return `${year}-${year}`
    }
  }

  return null
}

function buildTagQuery(tagData, filters = {}) {
  const segments = []
  const addSegment = (value, priority) => {
    if (!value) return
    const trimmed = value.trim()
    if (trimmed) {
      segments.push({ value: trimmed, priority })
    }
  }

  const genres = (tagData.genres || []).slice(0, 5)
  if (genres.length > 0) {
    const genreSegment = genres.map(genre => `genre:"${sanitizeTerm(genre)}"`).join(' OR ')
    addSegment(`(${genreSegment})`, 1)
  }

  const artists = (tagData.similarArtists || []).slice(0, 3)
  if (artists.length > 0) {
    const artistSegment = artists.map(artist => `artist:"${sanitizeTerm(artist)}"`).join(' OR ')
    addSegment(`(${artistSegment})`, 2)
  }

  const moods = (tagData.moods || []).slice(0, 5)
  if (moods.length > 0) {
    const moodSegment = moods.map(mood => `"${sanitizeTerm(mood)}"`).join(' ')
    addSegment(moodSegment, 4)
  }

  const eras = (tagData.eras || [])
    .map(convertEraToYearRange)
    .filter(Boolean)

  if (eras.length > 0) {
    eras.forEach(range => addSegment(`year:${range}`, 3))
  }

  if (filters.genre) {
    addSegment(`genre:"${sanitizeTerm(filters.genre)}"`, 0)
  }

  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom || filters.yearTo
    const to = filters.yearTo || filters.yearFrom
    if (from) {
      addSegment(`year:${from}-${to || from}`, 0)
    }
  }

  if (segments.length === 0) {
    return 'genre:indie'
  }

  const composeQuery = (items) => items.map(segment => segment.value).join(' ')

  let activeSegments = [...segments]
  let query = composeQuery(activeSegments)

  if (query.length <= 250) {
    return query
  }

  const removable = [...activeSegments].sort((a, b) => b.priority - a.priority)

  while (query.length > 250 && removable.length > 0) {
    const toRemove = removable.shift()
    activeSegments = activeSegments.filter(segment => segment !== toRemove)
    query = composeQuery(activeSegments)
  }

  if (query.length > 250) {
    query = query.slice(0, 240)
  }

  if (!query.trim()) {
    return 'genre:indie'
  }

  return query
}

function filterByPopularity(tracks, popularityFilter) {
  if (!popularityFilter || popularityFilter === 'any') {
    return tracks
  }

  switch (popularityFilter) {
    case 'high':
      return tracks.filter(track => (track.popularity ?? 0) >= 70)
    case 'medium':
      return tracks.filter(track => {
        const pop = track.popularity ?? 0
        return pop >= 40 && pop < 70
      })
    case 'low':
      return tracks.filter(track => (track.popularity ?? 0) < 40)
    default:
      return tracks
  }
}

function filterByYear(tracks, yearFrom, yearTo) {
  if (!yearFrom && !yearTo) {
    return tracks
  }

  const from = yearFrom ? Number(yearFrom) : null
  const to = yearTo ? Number(yearTo) : null

  return tracks.filter(track => {
    if (!track.releaseYear) return false
    if (from && track.releaseYear < from) return false
    if (to && track.releaseYear > to) return false
    return true
  })
}

async function fetchArtistsGenres(artistIds, token) {
  const uniqueIds = [...new Set(artistIds.filter(Boolean))]
  if (uniqueIds.length === 0) {
    return {}
  }

  const genreMap = {}
  const chunkSize = 50

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize)
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/artists?ids=${chunk.join(',')}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        console.warn('Не удалось получить жанры артистов:', errorBody)
        continue
      }

      const data = await response.json()
      data.artists?.forEach(artist => {
        genreMap[artist.id] = artist.genres || []
      })
    } catch (err) {
      console.warn('Ошибка запроса жанров артистов:', err)
    }
  }

  return genreMap
}

async function applyGenreFilter(tracks, genreFilter, token) {
  if (!genreFilter) {
    return tracks
  }

  const artistIds = tracks.flatMap(track => track.artistIds || [])
  const genreMap = await fetchArtistsGenres(artistIds, token)
  const genreLower = genreFilter.toLocaleLowerCase()

  return tracks
    .map(track => {
      const artistGenres = (track.artistIds || []).flatMap(id => genreMap[id] || [])
      return { ...track, artistGenres }
    })
    .filter(track => track.artistGenres.some(genre => genre.toLocaleLowerCase().includes(genreLower)))
}

async function getClientCredentialsToken() {
  const { CLIENT_ID, CLIENT_SECRET } = SPOTIFY_CONFIG

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify Client ID и Client Secret не настроены. См. README.md')
  }

  try {
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Ошибка получения токена: ${response.status} - ${errorData.error_description || response.statusText}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000

    return accessToken
  } catch (error) {
    console.error('Ошибка получения Spotify токена:', error)
    throw error
  }
}

export const spotifyAPI = {
  setAccessToken(token) {
    accessToken = token
    tokenExpiryTime = Date.now() + 3600000 // 1 час
  },

  async getAccessToken() {
    if (accessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
      return accessToken
    }

    try {
      return await getClientCredentialsToken()
    } catch (error) {
      console.error('Не удалось получить токен Spotify:', error)
      return null
    }
  },

  async searchTracks(query, limit = RESULTS_PER_PAGE) {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error('Не удалось получить токен доступа Spotify. Проверьте настройки CLIENT_ID и CLIENT_SECRET.')
    }

    try {
      const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: String(limit),
        market: 'US',
      })

      const response = await fetch(`${SPOTIFY_API_BASE}/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      if (!data.tracks || !data.tracks.items) {
        return []
      }

      return data.tracks.items.map(mapSpotifyTrack)
    } catch (error) {
      console.error('Spotify search error:', error)
      throw error
    }
  },

  async searchTracksByTags(tagData, { page = 0, limit = RESULTS_PER_PAGE, filters: appliedFilters = {} } = {}) {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error('Не удалось получить токен доступа Spotify. Проверьте настройки CLIENT_ID и CLIENT_SECRET.')
    }

    const query = buildTagQuery(tagData, appliedFilters)

    try {
      const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: String(limit),
        offset: String(page * limit),
        market: 'US',
      })

      const response = await fetch(`${SPOTIFY_API_BASE}/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      let tracks = data.tracks?.items?.map(mapSpotifyTrack) || []

      if (appliedFilters.genre) {
        tracks = await applyGenreFilter(tracks, appliedFilters.genre, token)
      }

      tracks = filterByPopularity(tracks, appliedFilters.popularity)
      tracks = filterByYear(tracks, appliedFilters.yearFrom, appliedFilters.yearTo)

      return {
        items: tracks,
        hasMore: Boolean(data.tracks?.next) || tracks.length === limit,
      }
    } catch (error) {
      console.error('Spotify tag search error:', error)
      throw error
    }
  },

  async getTrackDetails(trackId) {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error('Не удалось получить токен доступа Spotify. Проверьте настройки CLIENT_ID и CLIENT_SECRET.')
    }

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const track = await response.json()
      return mapSpotifyTrack(track)
    } catch (error) {
      console.error('Spotify track details error:', error)
      throw error
    }
  },
}

function filterMockByPopularity(tracks, popularityFilter) {
  if (!popularityFilter || popularityFilter === 'any') {
    return tracks
  }

  switch (popularityFilter) {
    case 'high':
      return tracks.filter(track => track.popularity >= 70)
    case 'medium':
      return tracks.filter(track => track.popularity >= 40 && track.popularity < 70)
    case 'low':
      return tracks.filter(track => track.popularity < 40)
    default:
      return tracks
  }
}

function filterMockByYear(tracks, yearFrom, yearTo) {
  if (!yearFrom && !yearTo) {
    return tracks
  }

  const from = yearFrom ? Number(yearFrom) : null
  const to = yearTo ? Number(yearTo) : null

  return tracks.filter(track => {
    if (!track.releaseYear) return false
    if (from && track.releaseYear < from) return false
    if (to && track.releaseYear > to) return false
    return true
  })
}

function filterMockByGenre(tracks, genreFilter) {
  if (!genreFilter) {
    return tracks
  }

  const genreLower = genreFilter.toLocaleLowerCase()
  return tracks.filter(track =>
    (track.artistGenres || []).some(genre => genre.toLocaleLowerCase().includes(genreLower)),
  )
}

export const mockSpotifyAPI = {
  async searchTracks(query, limit = RESULTS_PER_PAGE) {
    await delay(300)

    const queryLower = query.toLowerCase().trim()

    if (!queryLower) {
      return MOCK_TRACKS.slice(0, limit)
    }

    const filtered = MOCK_TRACKS.filter(track => {
      const haystack = `${track.name} ${track.artists} ${track.album}`.toLowerCase()
      return haystack.includes(queryLower)
    })

    if (filtered.length === 0) {
      return MOCK_TRACKS.slice(0, Math.min(limit, 5))
    }

    return filtered.slice(0, limit)
  },

  async searchTracksByTags(tagData, { page = 0, limit = RESULTS_PER_PAGE, filters = {} } = {}) {
    await delay(300)

    const keywords = [
      ...(tagData.genres || []),
      ...(tagData.moods || []),
      ...(tagData.similarArtists || []),
    ]
      .map(keyword => keyword.toLocaleLowerCase())
      .filter(Boolean)

    let filtered = MOCK_TRACKS

    if (keywords.length > 0) {
      filtered = filtered.filter(track => {
        const haystack = `${track.name} ${track.artists} ${track.album} ${(track.artistGenres || []).join(' ')}`.toLocaleLowerCase()
        return keywords.some(keyword => haystack.includes(keyword))
      })
    }

    filtered = filterMockByGenre(filtered, filters.genre)
    filtered = filterMockByPopularity(filtered, filters.popularity)
    filtered = filterMockByYear(filtered, filters.yearFrom, filters.yearTo)

    const start = page * limit
    const end = start + limit
    const items = filtered.slice(start, end)
    const hasMore = end < filtered.length

    return {
      items,
      hasMore,
    }
  },
}



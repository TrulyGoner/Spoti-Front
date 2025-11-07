import { openDB } from 'idb'

const DB_NAME = 'soundsphere'
const DB_VERSION = 1

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('tracks')) {
      db.createObjectStore('tracks', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('playlists')) {
      db.createObjectStore('playlists', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('ratings')) {
      db.createObjectStore('ratings', { keyPath: 'trackId' })
    }
    if (!db.objectStoreNames.contains('tags')) {
      db.createObjectStore('tags', { keyPath: 'trackId' })
    }
    if (!db.objectStoreNames.contains('statistics')) {
      db.createObjectStore('statistics', { keyPath: 'trackId' })
    }
  },
})

export const dbService = {
  async saveTrack(track) {
    const db = await dbPromise
    await db.put('tracks', track)
  },

  async getTrack(id) {
    const db = await dbPromise
    return await db.get('tracks', id)
  },

  async getAllTracks() {
    const db = await dbPromise
    return await db.getAll('tracks')
  },

  async savePlaylist(playlist) {
    const db = await dbPromise
    await db.put('playlists', playlist)
  },

  async getPlaylist(id) {
    const db = await dbPromise
    return await db.get('playlists', id)
  },

  async getAllPlaylists() {
    const db = await dbPromise
    return await db.getAll('playlists')
  },

  async saveRating(trackId, rating) {
    const db = await dbPromise
    await db.put('ratings', { trackId, rating })
  },

  async getRating(trackId) {
    const db = await dbPromise
    const result = await db.get('ratings', trackId)
    return result?.rating || null
  },

  async getAllRatings() {
    const db = await dbPromise
    return await db.getAll('ratings')
  },

  async saveTags(trackId, tags) {
    const db = await dbPromise
    await db.put('tags', { trackId, tags })
  },

  async getTags(trackId) {
    const db = await dbPromise
    const result = await db.get('tags', trackId)
    return result?.tags || []
  },

  async saveStatistics(trackId, stats) {
    const db = await dbPromise
    await db.put('statistics', { trackId, ...stats })
  },

  async getStatistics(trackId) {
    const db = await dbPromise
    return await db.get('statistics', trackId)
  },

  async getAllStatistics() {
    const db = await dbPromise
    return await db.getAll('statistics')
  },
}


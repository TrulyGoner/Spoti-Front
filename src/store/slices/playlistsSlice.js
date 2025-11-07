import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setPlaylists: (state, action) => {
      state.items = action.payload
    },
    addPlaylist: (state, action) => {
      state.items.push(action.payload)
    },
    updatePlaylist: (state, action) => {
      const { id, ...updates } = action.payload
      const index = state.items.findIndex(p => p.id === id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates }
      }
    },
    deletePlaylist: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload)
    },
    addTrackToPlaylist: (state, action) => {
      const { playlistId, track } = action.payload
      const playlist = state.items.find(p => p.id === playlistId)
      if (playlist && !playlist.tracks.find(t => t.id === track.id)) {
        playlist.tracks.push(track)
      }
    },
    removeTrackFromPlaylist: (state, action) => {
      const { playlistId, trackId } = action.payload
      const playlist = state.items.find(p => p.id === playlistId)
      if (playlist) {
        playlist.tracks = playlist.tracks.filter(t => t.id !== trackId)
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setPlaylists,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  setLoading,
  setError,
} = playlistsSlice.actions

export default playlistsSlice.reducer


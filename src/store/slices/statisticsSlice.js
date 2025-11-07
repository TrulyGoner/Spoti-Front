import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playCounts: {},
  lastPlayed: {},
  totalPlays: 0,
  topTracks: [],
  topArtists: [],
}

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    incrementPlayCount: (state, action) => {
      const trackId = action.payload
      if (!state.playCounts[trackId]) {
        state.playCounts[trackId] = 0
      }
      state.playCounts[trackId]++
      state.totalPlays++
      state.lastPlayed[trackId] = new Date().toISOString()
    },
    setPlayCount: (state, action) => {
      const { trackId, count } = action.payload
      state.playCounts[trackId] = count
    },
    setTopTracks: (state, action) => {
      state.topTracks = action.payload
    },
    setTopArtists: (state, action) => {
      state.topArtists = action.payload
    },
    resetStatistics: (state) => {
      state.playCounts = {}
      state.lastPlayed = {}
      state.totalPlays = 0
      state.topTracks = []
      state.topArtists = []
    },
  },
})

export const {
  incrementPlayCount,
  setPlayCount,
  setTopTracks,
  setTopArtists,
  resetStatistics,
} = statisticsSlice.actions

export default statisticsSlice.reducer


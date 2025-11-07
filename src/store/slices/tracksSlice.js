import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  ratings: {},
  tags: {},
  loading: false,
  error: null,
}

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setTracks: (state, action) => {
      state.items = action.payload
    },
    addTrack: (state, action) => {
      const track = action.payload
      if (!state.items.find(t => t.id === track.id)) {
        state.items.push(track)
      }
    },
    setRating: (state, action) => {
      const { trackId, rating } = action.payload
      state.ratings[trackId] = rating
    },
    setTags: (state, action) => {
      const { trackId, tags } = action.payload
      state.tags[trackId] = tags
    },
    addTag: (state, action) => {
      const { trackId, tag } = action.payload
      if (!state.tags[trackId]) {
        state.tags[trackId] = []
      }
      if (!state.tags[trackId].includes(tag)) {
        state.tags[trackId].push(tag)
      }
    },
    removeTag: (state, action) => {
      const { trackId, tag } = action.payload
      if (state.tags[trackId]) {
        state.tags[trackId] = state.tags[trackId].filter(t => t !== tag)
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
  setTracks,
  addTrack,
  setRating,
  setTags,
  addTag,
  removeTag,
  setLoading,
  setError,
} = tracksSlice.actions

export default tracksSlice.reducer


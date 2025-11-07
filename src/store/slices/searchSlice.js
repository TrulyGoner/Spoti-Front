import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  preferences: '',
  preferencesError: null,
  generatedTags: null,
  tagLoading: false,
  tagSource: null,
  filters: {
    popularity: 'any',
    genre: '',
    yearFrom: '',
    yearTo: '',
  },
  page: 0,
  hasMore: true,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload
    },
    setResults: (state, action) => {
      state.results = action.payload
    },
    appendResults: (state, action) => {
      state.results = [...state.results, ...action.payload]
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload
    },
    setPreferencesError: (state, action) => {
      state.preferencesError = action.payload
    },
    setGeneratedTags: (state, action) => {
      state.generatedTags = action.payload?.data || null
      state.tagSource = action.payload?.source || null
    },
    setTagLoading: (state, action) => {
      state.tagLoading = action.payload
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload
    },
    clearResults: (state) => {
      state.results = []
      state.query = ''
      state.page = 0
      state.hasMore = true
    },
    resetSearchFlow: (state) => {
      Object.assign(state, initialState)
    },
  },
})

export const {
  setQuery,
  setResults,
  appendResults,
  setLoading,
  setError,
  setPreferences,
  setPreferencesError,
  setGeneratedTags,
  setTagLoading,
  setFilters,
  setPage,
  setHasMore,
  clearResults,
  resetSearchFlow,
} = searchSlice.actions

export default searchSlice.reducer


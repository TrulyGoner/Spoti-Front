import { configureStore } from '@reduxjs/toolkit'
import tracksReducer from './slices/tracksSlice'
import playlistsReducer from './slices/playlistsSlice'
import searchReducer from './slices/searchSlice'
import statisticsReducer from './slices/statisticsSlice'

export const store = configureStore({
  reducer: {
    tracks: tracksReducer,
    playlists: playlistsReducer,
    search: searchReducer,
    statistics: statisticsReducer,
  },
})


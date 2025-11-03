import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SearchState {
  searchTerm: string
  searchYear: string
  filters: {
    yearFrom?: string
    yearTo?: string
    type?: string
  }
  recentSearches: string[]
}

const initialState: SearchState = {
  searchTerm: '',
  searchYear: '',
  filters: {},
  recentSearches: [],
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setSearchYear: (state, action: PayloadAction<string>) => {
      state.searchYear = action.payload
    },
    setFilters: (state, action: PayloadAction<SearchState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
      state.searchTerm = ''
      state.searchYear = ''
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(search => search !== action.payload)
      ].slice(0, 10)
    },
    clearSearch: (state) => {
      state.searchTerm = ''
      state.searchYear = ''
    }
  },
})

export const { 
  setSearchTerm, 
  setSearchYear, 
  setFilters, 
  clearFilters, 
  addRecentSearch,
  clearSearch
} = searchSlice.actions

export default searchSlice.reducer
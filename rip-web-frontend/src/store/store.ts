import { configureStore } from '@reduxjs/toolkit'
import cartSlice from '../slices/cartSlice'
import searchSlice from '../slices/searchSlice'

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    search: searchSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
import { configureStore } from '@reduxjs/toolkit'
import cartSlice from '../slices/cartSlice'
import searchSlice from '../slices/searchSlice'
import authSlice from '../slices/authSlice'
import treeSlice from '../slices/treeSlice'

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    search: searchSlice,
    auth: authSlice,
    trees: treeSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
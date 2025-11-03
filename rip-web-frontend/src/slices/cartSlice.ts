import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CartState {
  itemCount: number
  userId: number
  isLoading: boolean
}

const initialState: CartState = {
  itemCount: 0,
  userId: -1,
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    incrementCart: (state) => {
      state.itemCount += 1
    },
    decrementCart: (state) => {
      state.itemCount = Math.max(0, state.itemCount - 1)
    },
    setCartCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload
    },
    clearCart: (state) => {
      state.itemCount = 0
      state.userId = -1
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    // Обновляем из API (сохраняем и item_count и user_id)
    updateCartFromApi: (state, action: PayloadAction<{user_id: number, item_count: number}>) => {
      state.itemCount = action.payload.item_count
      state.userId = action.payload.user_id
    }
  },
})

export const { 
  incrementCart, 
  decrementCart, 
  setCartCount, 
  clearCart, 
  setCartLoading,
  updateCartFromApi 
} = cartSlice.actions

export default cartSlice.reducer
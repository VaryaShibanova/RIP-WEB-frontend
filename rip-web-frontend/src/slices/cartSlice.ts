import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

interface CartState {
  itemCount: number
  userId: number
  treeId: number
  isLoading: boolean
}

const initialState: CartState = {
  itemCount: 0,
  userId: -1,
  treeId: 0,
  isLoading: false,
}

export const syncCartWithApi = createAsyncThunk(
  'cart/syncCartWithApi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.treesCartList()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка синхронизации корзины')
    }
  }
)

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
    setCartCount: (state, action: { payload: number }) => {
      state.itemCount = action.payload
    },
    clearCart: (state) => {
      state.itemCount = 0
      state.userId = -1
      state.treeId = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCartWithApi.fulfilled, (state, action) => {
        state.itemCount = action.payload.item_count || 0
        state.userId = action.payload.user_id || -1
        state.treeId = action.payload.tree_id || 0
      })
  },
})

export const { 
  incrementCart, 
  decrementCart, 
  setCartCount, 
  clearCart 
} = cartSlice.actions
export default cartSlice.reducer
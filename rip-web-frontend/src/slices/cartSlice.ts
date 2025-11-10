// cartSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

export interface CartState {
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
      // Проверяем, что данные пришли и они корректны
      if (response.data && typeof response.data.item_count === 'number') {
        return response.data
      } else {
        // Если данные некорректны, возвращаем значения по умолчанию
        return {
          item_count: 0,
          user_id: -1,
          tree_id: 0
        }
      }
    } catch (error: any) {
      // Если ошибка (например, 401 для неавторизованных), возвращаем значения по умолчанию
      if (error.response?.status === 401) {
        return {
          item_count: 0,
          user_id: -1,
          tree_id: 0
        }
      }
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
      .addCase(syncCartWithApi.pending, (state) => {
        state.isLoading = true
      })
      .addCase(syncCartWithApi.fulfilled, (state, action) => {
        state.isLoading = false
        state.itemCount = action.payload.item_count || 0
        state.userId = action.payload.user_id || -1
        state.treeId = action.payload.tree_id || 0
      })
      .addCase(syncCartWithApi.rejected, (state) => {
        state.isLoading = false
        // При ошибке тоже устанавливаем значения по умолчанию
        state.itemCount = 0
        state.userId = -1
        state.treeId = 0
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
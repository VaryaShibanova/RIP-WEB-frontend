import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'
import type { 
  TreeShortResponse, 
  TreeDetailResponse,
  UpdateTreeRequest
} from '../types'

export interface TreeState {
  trees: TreeShortResponse[]
  currentTree: TreeDetailResponse | null
  isLoading: boolean
  error: string | null
}

const initialState: TreeState = {
  trees: [],
  currentTree: null,
  isLoading: false,
  error: null,
}

export const fetchUserTrees = createAsyncThunk(
  'trees/fetchUserTrees',
  async (filters?: { status?: string; date_from?: string; date_to?: string }, { rejectWithValue }) => {
    try {
      const response = await api.api.treesList(filters)
      return response.data.trees || []
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявок')
    }
  }
)

export const fetchTreeById = createAsyncThunk(
  'trees/fetchTreeById',
  async (treeId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.treesDetail(treeId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявки')
    }
  }
)

export const addToTree = createAsyncThunk(
  'trees/addToTree',
  async (anomalyId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.treesCurrentItemsCreate({ anomaly_id: anomalyId })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка добавления в заявку')
    }
  }
)

export const updateTreeItem = createAsyncThunk(
  'trees/updateTreeItem',
  async ({ 
    treeId, 
    anomalyId, 
    anomalousRings 
  }: { 
    treeId: number; 
    anomalyId: number; 
    anomalousRings: string 
  }, { rejectWithValue }) => {
    try {
      const response = await api.api.treesItemsUpdate(treeId, anomalyId, { anomalous_rings: anomalousRings })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления элемента')
    }
  }
)

export const removeFromTree = createAsyncThunk(
  'trees/removeFromTree',
  async ({ treeId, anomalyId }: { treeId: number; anomalyId: number }, { rejectWithValue }) => {
    try {
      await api.api.treesItemsDelete(treeId, anomalyId)
      return { treeId, anomalyId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления элемента')
    }
  }
)

export const submitTree = createAsyncThunk(
  'trees/submitTree',
  async (treeId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.treesFormUpdate(treeId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка формирования заявки')
    }
  }
)

export const updateTree = createAsyncThunk(
  'trees/updateTree',
  async ({ treeId, data }: { treeId: number; data: UpdateTreeRequest }, { rejectWithValue }) => {
    try {
      const response = await api.api.treesUpdate(treeId, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления заявки')
    }
  }
)

export const deleteTree = createAsyncThunk(
  'trees/deleteTree',
  async (treeId: number, { rejectWithValue }) => {
    try {
      await api.api.treesDelete(treeId)
      return treeId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления заявки')
    }
  }
)

const treeSlice = createSlice({
  name: 'trees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentTree: (state) => {
      state.currentTree = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTrees.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserTrees.fulfilled, (state, action) => {
        state.isLoading = false
        state.trees = action.payload
        state.error = null
      })
      .addCase(fetchUserTrees.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchTreeById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTreeById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTree = action.payload
        state.error = null
      })
      .addCase(fetchTreeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addToTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(removeFromTree.fulfilled, (state, action) => {
        const { treeId, anomalyId } = action.payload
        if (state.currentTree && state.currentTree.tree?.id === treeId) {
          state.currentTree.treeItems = state.currentTree.treeItems?.filter(
            item => item.anomaly_id !== anomalyId
          ) || []
        }
        state.error = null
      })
      .addCase(submitTree.fulfilled, (state, action) => {
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = action.payload
        }
        state.error = null
      })
      .addCase(updateTree.fulfilled, (state, action) => {
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = action.payload
        }
        state.error = null
      })
      .addCase(deleteTree.fulfilled, (state, action) => {
        state.trees = state.trees.filter(tree => tree.id !== action.payload)
        state.currentTree = null
        state.error = null
      })
  },
})

export const { clearError, clearCurrentTree } = treeSlice.actions
export default treeSlice.reducer
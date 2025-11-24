import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'
import type { 
  TreeShortResponse, 
  TreeDetailResponse,
  UpdateTreeRequest
} from '../types'

export interface TreeLocalData {
  description: string;
  totalRings: string;
  anomalousRings: Record<number, string>;
}

export interface TreeState {
  trees: TreeShortResponse[]
  currentTree: TreeDetailResponse | null
  isLoading: boolean
  error: string | null
  localTreeData: {
    [treeId: number]: TreeLocalData
  }
}

const initialState: TreeState = {
  trees: [],
  currentTree: null,
  isLoading: false,
  error: null,
  localTreeData: {}
}

// Для пользователя - загружаем все его заявки без фильтров
export const fetchUserTrees = createAsyncThunk(
  'trees/fetchUserTrees',
  async (filters: { status?: string; date_from?: string; date_to?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.api.treesList(filters)
      return response.data.trees || []
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявок')
    }
  }
)

export const fetchModeratorTrees = createAsyncThunk(
  'trees/fetchModeratorTrees',
  async (filters: { status?: string; date_from?: string; date_to?: string } | undefined, { rejectWithValue }) => {
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

// ОБНОВЛЕНИЕ АНОМАЛЬНЫХ КОЛЕЦ
export const updateTreeItem = createAsyncThunk(
  'trees/updateTreeItem',
  async (params: { 
    treeId: number; 
    anomalyId: number; 
    anomalousRings: string 
  }, { rejectWithValue }) => {
    try {
      const { treeId, anomalyId, anomalousRings } = params;
      const response = await api.api.treesItemsUpdate(treeId, anomalyId, { anomalous_rings: anomalousRings })
      return { 
        ...response.data, 
        anomalyId,
        treeId
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления элемента')
    }
  }
)

export const removeFromTree = createAsyncThunk(
  'trees/removeFromTree',
  async (params: { treeId: number; anomalyId: number }, { rejectWithValue }) => {
    try {
      const { treeId, anomalyId } = params;
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

// ОБНОВЛЕНИЕ ОСНОВНЫХ ДАННЫХ ЗАЯВКИ
export const updateTree = createAsyncThunk(
  'trees/updateTree',
  async (params: { treeId: number; data: UpdateTreeRequest }, { rejectWithValue }) => {
    try {
      const { treeId, data } = params;
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

// Действия для модератора
export const completeTree = createAsyncThunk(
  'trees/completeTree',
  async (params: { treeId: number; action: string }, { rejectWithValue }) => {
    try {
      const { treeId, action } = params;
      const response = await api.api.treesCompleteUpdate(treeId, { action })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка завершения заявки')
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
    setTreeLocalData: (state, action: { payload: { 
      treeId: number; 
      description?: string; 
      totalRings?: string;
      anomalousRings?: Record<number, string>;
    } }) => {
      const { treeId, description, totalRings, anomalousRings } = action.payload;
      
      // Инициализируем данные для конкретной заявки если их нет
      if (!state.localTreeData[treeId]) {
        state.localTreeData[treeId] = {
          description: '',
          totalRings: '',
          anomalousRings: {}
        };
      }
      
      // Обновляем только переданные поля
      if (description !== undefined) {
        state.localTreeData[treeId].description = description;
      }
      if (totalRings !== undefined) {
        state.localTreeData[treeId].totalRings = totalRings;
      }
      if (anomalousRings !== undefined) {
        // ИСПРАВЛЕНО: Используем type assertion для обхода проблемы типов
        state.localTreeData[treeId].anomalousRings = anomalousRings as Record<number, string>;
      }
    },
    clearTreeLocalData: (state, action: { payload: number }) => {
      const treeId = action.payload;
      if (state.localTreeData[treeId]) {
        delete state.localTreeData[treeId];
      }
    },
    removeAnomalousRings: (state, action: { payload: { treeId: number; anomalyId: number } }) => {
      const { treeId, anomalyId } = action.payload;
      if (state.localTreeData[treeId]) {
        const updatedRings = { ...state.localTreeData[treeId].anomalousRings };
        delete updatedRings[anomalyId];
        state.localTreeData[treeId].anomalousRings = updatedRings;
      }
    },
    updateCalculatedYear: (state, action: { payload: { 
      treeId: number; 
      anomalyId: number; 
      calculatedYear: number;
      finalYear?: number;
    } }) => {
      const { anomalyId, calculatedYear, finalYear } = action.payload;
      
      if (state.currentTree && state.currentTree.treeItems) {
        const itemIndex = state.currentTree.treeItems.findIndex(
          item => item.anomaly_id === anomalyId
        );
        if (itemIndex !== -1) {
          state.currentTree.treeItems[itemIndex].calculated_year = calculatedYear;
        }
      }
      
      if (finalYear !== undefined && state.currentTree && state.currentTree.tree) {
        state.currentTree.tree.final_year = finalYear;
      }
    }
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
      .addCase(fetchModeratorTrees.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchModeratorTrees.fulfilled, (state, action) => {
        state.isLoading = false
        state.trees = action.payload
        state.error = null
      })
      .addCase(fetchModeratorTrees.rejected, (state, action) => {
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
        
        const tree = action.payload.tree;
        if (tree && tree.id) {
          if (!state.localTreeData[tree.id]) {
            state.localTreeData[tree.id] = {
              description: tree.description || '',
              totalRings: tree.total_rings?.toString() || '',
              anomalousRings: {}
            };
          }
        }
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
        if (state.localTreeData[treeId]) {
          const updatedRings = { ...state.localTreeData[treeId].anomalousRings };
          delete updatedRings[anomalyId];
          state.localTreeData[treeId].anomalousRings = updatedRings;
        }
        state.error = null
      })
      .addCase(removeFromTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(submitTree.fulfilled, (state, action) => {
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = action.payload
        }
        const updatedTree = state.trees.find(tree => tree.id === action.payload.id)
        if (updatedTree) {
          updatedTree.status = action.payload.status
        }
        if (state.localTreeData[action.payload.id!]) {
          delete state.localTreeData[action.payload.id!];
        }
        state.error = null
      })
      .addCase(submitTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateTree.fulfilled, (state, action) => {
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = { ...state.currentTree.tree, ...action.payload };
        }
        const treeIndex = state.trees.findIndex(tree => tree.id === action.payload.id);
        if (treeIndex !== -1) {
          state.trees[treeIndex] = { ...state.trees[treeIndex], ...action.payload };
        }
        state.error = null
      })
      .addCase(updateTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateTreeItem.fulfilled, (state, action) => {
        const { anomalyId, anomalous_rings, calculated_year, treeId } = action.payload;
        
        if (state.currentTree && state.currentTree.treeItems) {
          const itemIndex = state.currentTree.treeItems.findIndex(
            item => item.anomaly_id === anomalyId
          );
          if (itemIndex !== -1) {
            state.currentTree.treeItems[itemIndex] = {
              ...state.currentTree.treeItems[itemIndex],
              anomalous_rings: anomalous_rings,
              calculated_year: calculated_year || state.currentTree.treeItems[itemIndex].calculated_year
            };
          }
        }
        
        if (state.localTreeData[treeId]) {
          // ИСПРАВЛЕНО: Используем type assertion
          state.localTreeData[treeId].anomalousRings = {
            ...state.localTreeData[treeId].anomalousRings,
            [anomalyId]: anomalous_rings
          } as Record<number, string>;
        }
        
        state.error = null
      })
      .addCase(updateTreeItem.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(deleteTree.fulfilled, (state, action) => {
        state.trees = state.trees.filter(tree => tree.id !== action.payload)
        state.currentTree = null
        if (state.localTreeData[action.payload]) {
          delete state.localTreeData[action.payload];
        }
        state.error = null
      })
      .addCase(deleteTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(completeTree.fulfilled, (state, action) => {
        const updatedTree = state.trees.find(tree => tree.id === action.payload.id)
        if (updatedTree) {
          updatedTree.status = action.payload.status
        }
        if (state.localTreeData[action.payload.id!]) {
          delete state.localTreeData[action.payload.id!];
        }
        state.error = null
      })
      .addCase(completeTree.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  clearCurrentTree,
  setTreeLocalData,
  clearTreeLocalData,
  removeAnomalousRings,
  updateCalculatedYear
} = treeSlice.actions

export default treeSlice.reducer
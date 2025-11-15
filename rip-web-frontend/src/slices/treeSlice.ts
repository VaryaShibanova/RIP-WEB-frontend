// treeSlice.ts - исправленная версия
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
  // Новое поле для локальных данных (как в поиске)
  localTreeData?: {
    [treeId: number]: {
      description: string;
      totalRings: string;
      anomalousRings: Record<number, string>;
    }
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
      const response = await api.api.treesCurrentItemsCreate({ anomaly_id: anomalyId }) //axios
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка добавления в заявку')
    }
  }
)

// ОБНОВЛЕНИЕ АНОМАЛЬНЫХ КОЛЕЦ (отдельный метод в бэке)
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
      return { ...response.data, anomalyId } // Добавляем anomalyId к ответу
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

// ОБНОВЛЕНИЕ ОСНОВНЫХ ДАННЫХ ЗАЯВКИ (отдельный метод в бэке)
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
    // Новые редьюсеры для локальных данных (как в поиске)
    setTreeLocalData: (state, action: { payload: { 
      treeId: number; 
      description?: string; 
      totalRings?: string;
      anomalousRings?: Record<number, string>;
    } }) => {
      const { treeId, description, totalRings, anomalousRings } = action.payload;
      
      // Инициализируем localTreeData если его нет
      if (!state.localTreeData) {
        state.localTreeData = {};
      }
      
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
        state.localTreeData[treeId].anomalousRings = anomalousRings;
      }

      console.log('🔄 setTreeLocalData:', { treeId, description, totalRings, anomalousRings });
    },
    clearTreeLocalData: (state, action: { payload: number }) => {
      const treeId = action.payload;
      if (state.localTreeData && state.localTreeData[treeId]) {
        delete state.localTreeData[treeId];
        console.log('🧹 clearTreeLocalData:', treeId);
      }
    },
    // Удаление конкретного anomalousRings
    removeAnomalousRings: (state, action: { payload: { treeId: number; anomalyId: number } }) => {
      const { treeId, anomalyId } = action.payload;
      if (state.localTreeData && state.localTreeData[treeId]) {
        const updatedRings = { ...state.localTreeData[treeId].anomalousRings };
        delete updatedRings[anomalyId];
        state.localTreeData[treeId].anomalousRings = updatedRings;
        console.log('🗑️ removeAnomalousRings:', { treeId, anomalyId });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Загрузка заявок пользователя
      .addCase(fetchUserTrees.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserTrees.fulfilled, (state, action) => {
        state.isLoading = false
        state.trees = action.payload
        state.error = null
        console.log('✅ fetchUserTrees.fulfilled:', action.payload.length, 'заявок');
      })
      .addCase(fetchUserTrees.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('❌ fetchUserTrees.rejected:', action.payload);
      })
      // Загрузка заявок модератора
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
      // Загрузка конкретной заявки
      .addCase(fetchTreeById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTreeById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTree = action.payload
        state.error = null
        
        // Инициализируем локальные данные при загрузке заявки
        const tree = action.payload.tree;
        if (tree && tree.id) {
          if (!state.localTreeData) {
            state.localTreeData = {};
          }
          
          // НЕ перезаписываем если уже есть пользовательские данные
          if (!state.localTreeData[tree.id]) {
            state.localTreeData[tree.id] = {
              description: tree.description || '',
              totalRings: tree.total_rings?.toString() || '',
              anomalousRings: {}
            };
            console.log('🆕 Инициализация локальных данных из API:', { 
              treeId: tree.id, 
              description: tree.description,
              totalRings: tree.total_rings 
            });
          } else {
            console.log('📋 Локальные данные уже существуют, сохраняем пользовательские изменения');
            // НЕ перезаписываем description и totalRings чтобы сохранить пользовательские изменения
          }
        }
        console.log('✅ fetchTreeById.fulfilled:', action.payload);
      })
      .addCase(fetchTreeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('❌ fetchTreeById.rejected:', action.payload);
      })
      // Добавление в заявку
      .addCase(addToTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ addToTree.rejected:', action.payload);
      })
      // Удаление из заявки
      .addCase(removeFromTree.fulfilled, (state, action) => {
        const { treeId, anomalyId } = action.payload
        // Обновляем currentTree
        if (state.currentTree && state.currentTree.tree?.id === treeId) {
          state.currentTree.treeItems = state.currentTree.treeItems?.filter(
            item => item.anomaly_id !== anomalyId
          ) || []
        }
        // Удаляем из локальных данных
        if (state.localTreeData && state.localTreeData[treeId]) {
          const updatedRings = { ...state.localTreeData[treeId].anomalousRings };
          delete updatedRings[anomalyId];
          state.localTreeData[treeId].anomalousRings = updatedRings;
        }
        state.error = null
        console.log('✅ removeFromTree.fulfilled:', { treeId, anomalyId });
      })
      .addCase(removeFromTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ removeFromTree.rejected:', action.payload);
      })
      // Подтверждение заявки
      .addCase(submitTree.fulfilled, (state, action) => {
        // Обновляем статус в текущей заявке
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = action.payload
        }
        // Обновляем статус в списке заявок
        const updatedTree = state.trees.find(tree => tree.id === action.payload.id)
        if (updatedTree) {
          updatedTree.status = action.payload.status
        }
        // Очищаем локальные данные для этой заявки
        if (state.localTreeData && state.localTreeData[action.payload.id!]) {
          delete state.localTreeData[action.payload.id!];
        }
        state.error = null
        console.log('✅ submitTree.fulfilled:', action.payload);
      })
      .addCase(submitTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ submitTree.rejected:', action.payload);
      })
      // Обновление заявки (описание находки и число всех колец)
      .addCase(updateTree.fulfilled, (state, action) => {
        // Обновляем currentTree
        if (state.currentTree && state.currentTree.tree) {
          state.currentTree.tree = { ...state.currentTree.tree, ...action.payload };
        }
        // Обновляем в списке trees
        const treeIndex = state.trees.findIndex(tree => tree.id === action.payload.id);
        if (treeIndex !== -1) {
          state.trees[treeIndex] = { ...state.trees[treeIndex], ...action.payload };
        }
        state.error = null
        console.log('✅ updateTree.fulfilled (основные данные):', action.payload);
      })
      .addCase(updateTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ updateTree.rejected:', action.payload);
      })
      // Обновление аномальных колец - ИСПРАВЛЕННАЯ ВЕРСИЯ
      .addCase(updateTreeItem.fulfilled, (state, action) => {
        const { anomalyId, anomalous_rings, calculated_year } = action.payload;
        
        // Обновляем currentTree
        if (state.currentTree && state.currentTree.treeItems) {
          const itemIndex = state.currentTree.treeItems.findIndex(
            item => item.anomaly_id === anomalyId
          );
          if (itemIndex !== -1) {
            state.currentTree.treeItems[itemIndex] = {
              ...state.currentTree.treeItems[itemIndex],
              anomalous_rings: anomalous_rings,
              calculated_year: calculated_year
            };
          }
        }
        state.error = null
        console.log('✅ updateTreeItem.fulfilled (аномальные кольца):', action.payload);
      })
      .addCase(updateTreeItem.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ updateTreeItem.rejected:', action.payload);
      })
      // Удаление заявки
      .addCase(deleteTree.fulfilled, (state, action) => {
        state.trees = state.trees.filter(tree => tree.id !== action.payload)
        state.currentTree = null
        // Очищаем локальные данные
        if (state.localTreeData && state.localTreeData[action.payload]) {
          delete state.localTreeData[action.payload];
        }
        state.error = null
        console.log('✅ deleteTree.fulfilled:', action.payload);
      })
      .addCase(deleteTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ deleteTree.rejected:', action.payload);
      })
      // Завершение заявки модератором
      .addCase(completeTree.fulfilled, (state, action) => {
        // Обновляем статус в списке заявок после действий модератора
        const updatedTree = state.trees.find(tree => tree.id === action.payload.id)
        if (updatedTree) {
          updatedTree.status = action.payload.status
        }
        // Очищаем локальные данные для завершенной заявки
        if (state.localTreeData && state.localTreeData[action.payload.id!]) {
          delete state.localTreeData[action.payload.id!];
        }
        state.error = null
        console.log('✅ completeTree.fulfilled:', action.payload);
      })
      .addCase(completeTree.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('❌ completeTree.rejected:', action.payload);
      })
  },
})

export const { 
  clearError, 
  clearCurrentTree,
  setTreeLocalData,
  clearTreeLocalData,
  removeAnomalousRings
} = treeSlice.actions

export default treeSlice.reducer
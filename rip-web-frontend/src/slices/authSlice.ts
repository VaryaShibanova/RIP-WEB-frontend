import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type { LoginRequest, UserResponse, RegisterRequest } from '../types';

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      localStorage.setItem('token', response.data.token!);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser', 
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersRegisterCreate(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.usersMeList();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения данных пользователя');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.api.usersLogoutCreate();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.error || 'Ошибка выхода');
    }
  }
);

// ИСПРАВЛЕННЫЙ МЕТОД - не обновляет весь пользователя, только логин
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData: { login?: string }, { rejectWithValue }) => {
    try {
      const response = await api.api.usersProfileUpdate(userData);
      // Возвращаем только обновленные данные, не весь объект пользователя
      return { login: response.data.login };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления профиля');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user!;
        state.token = action.payload.token!;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Update Profile - ИСПРАВЛЕНО: обновляем только логин
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.login = action.payload.login;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
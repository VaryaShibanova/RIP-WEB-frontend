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

// ИНИЦИАЛИЗИРУЕМ ИЗ localStorage, но isAuthenticated = false пока не проверим
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      const token = response.data.token!;
      localStorage.setItem('token', token);
      return { ...response.data, token };
    } catch (error: any) {
      localStorage.removeItem('token');
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await api.api.usersMeList();
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения данных пользователя');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await api.api.usersLogoutCreate();
    } catch (error: any) {
      // Игнорируем ошибки логаута на сервере
    } finally {
      localStorage.removeItem('token');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData: { login?: string }, { rejectWithValue }) => {
    try {
      const response = await api.api.usersProfileUpdate(userData);
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
    // Action для принудительного сброса авторизации
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
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
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.token = localStorage.getItem('token');
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.isLoading = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.login = action.payload.login;
        }
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
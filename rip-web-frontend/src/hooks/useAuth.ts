import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser,
  clearError 
} from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const login = useCallback(async (credentials: { login: string; password: string }) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const register = useCallback(async (userData: { login: string; password: string }) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    resetError,
  };
};
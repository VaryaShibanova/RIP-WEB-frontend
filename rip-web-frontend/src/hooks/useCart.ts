import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  incrementCart, 
  decrementCart, 
  setCartCount, 
  clearCart,
  syncCartWithApi as syncCartWithApiThunk
} from '../slices/cartSlice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);

  const addItemToCart = useCallback(() => {
    dispatch(incrementCart());
  }, [dispatch]);

  const removeItemFromCart = useCallback(() => {
    dispatch(decrementCart());
  }, [dispatch]);

  const clearCartItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const setItemCount = useCallback((count: number) => {
    dispatch(setCartCount(count));
  }, [dispatch]);

  const syncCartWithApi = useCallback(async () => {
    try {
      await dispatch(syncCartWithApiThunk()).unwrap();
    } catch (error) {
      console.error('Error syncing cart with API:', error);
    }
  }, [dispatch]);

  return {
    itemCount: cart.itemCount,
    userId: cart.userId,
    treeId: cart.treeId,
    isLoading: cart.isLoading,
    addItemToCart,
    removeItemFromCart,
    clearCartItems,
    setItemCount,
    syncCartWithApi
  };
};
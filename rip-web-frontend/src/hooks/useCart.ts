import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { 
  incrementCart, 
  decrementCart, 
  setCartCount, 
  clearCart, 
  setCartLoading,
  updateCartFromApi 
} from '../slices/cartSlice'
import { apiService } from '../services/api'
import type { AnomalyShortResponse } from '../types'

export const useCart = () => {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(state => state.cart)

  const addItemToCart = useCallback((anomaly: AnomalyShortResponse) => {
    dispatch(incrementCart())
    console.log('Добавлено в корзину:', anomaly.id)
  }, [dispatch])

  // Убрали неиспользуемый параметр id
  const removeItemFromCart = useCallback(() => {
    dispatch(decrementCart())
  }, [dispatch])

  const clearCartItems = useCallback(() => {
    dispatch(clearCart())
  }, [dispatch])

  const setItemCount = useCallback((count: number) => {
    dispatch(setCartCount(count))
  }, [dispatch])

  const syncCartWithApi = useCallback(async () => {
    dispatch(setCartLoading(true))
    try {
      const cartData = await apiService.getTreeCart()
      dispatch(updateCartFromApi(cartData))
    } catch (error) {
      console.error('Error syncing cart with API:', error)
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [dispatch])

  return {
    itemCount: cart.itemCount,
    userId: cart.userId,
    isLoading: cart.isLoading,
    addItemToCart,
    removeItemFromCart,
    clearCartItems,
    setItemCount,
    syncCartWithApi
  }
}
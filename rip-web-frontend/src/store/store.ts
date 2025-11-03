import { configureStore } from '@reduxjs/toolkit'

// Пока создадим пустой store, потом добавим редьюсеры
export const store = configureStore({
  reducer: {
    // Здесь будут ваши редьюсеры
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
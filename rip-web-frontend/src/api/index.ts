import { Api } from './Api';

// Один раз объявляем и экспортируем
export const api = new Api({
  baseURL: 'http://localhost:8080',
});

// Настраиваем интерцепторы
api.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


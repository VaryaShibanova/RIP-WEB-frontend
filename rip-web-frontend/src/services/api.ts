// services/api.ts
import type { 
  Anomaly, 
  AnomaliesListResponse, 
  AnomalyDetailResponse,  
} from '../types';
import { dest_api } from '../target_config'; // ИМПОРТИРУЕМ dest_api

// Mock данные с обновленными путями
const mockAnomalies: Anomaly[] = [
  {
    id: 1,
    name: "Извержение вулкана Уайнапутина",
    description: "На срезе дерева, жившего в 1600 году, хорошо заметно одно очень узкое и темное годовое кольцо. Оно резко контрастирует с более широкими светлыми кольцами до и после него. Это кольцо 1601 года.",
    image_url: "/RIP-WEB-frontend/images/mock/main-page.png",
    year: 1600 
  },
  {
    id: 2,
    name: "Извержение Тамбора", 
    description: "На срезе дерева хорошо видно три аномальных кольца старше. Такие кольца 1815 года характеризуются узкими, фрагментированными темными кольцами 1816 года и относительно широкими кольцами 1817 года.",
    image_url: "/RIP-WEB-frontend/images/mock/main-page.png",
    year: 1815
  },
  {
    id: 3,
    name: "Извержение Каракатау",
    description: "На срезе дерева, примерно на 15-16 кольцах от края, видны аномальные кольца второго следования 1884 года, например фрагментированное кольцо 1883 года и относительно широкими кольцами 1882 года.",
    image_url: "/RIP-WEB-frontend/images/mock/main-page.png", 
    year: 1883
  }
];

class ApiService {
  private async fetchWithTimeout<T>(url: string, timeout = 5000): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithFallback<T>(endpoint: string, mockData: T, timeout = 5000): Promise<T> {
    // Если на GitHub Pages - сразу возвращаем моки
    if (window.location.hostname.includes('github.io')) {
      console.log('GitHub Pages - using mock data for:', endpoint);
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockData), 100);
      });
    }
    
    const url = `${dest_api}${endpoint}`;
    console.log('Fetching from:', url);
    
    try {
      return await this.fetchWithTimeout<T>(url, timeout);
    } catch (error) {
      console.warn(`API ${url} failed, using mock data:`, error);
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockData), 100);
      });
    }
  }

  async getAnomalies(name?: string, year?: string): Promise<AnomaliesListResponse> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    const endpoint = `/anomalies${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithFallback(endpoint, this.getMockAnomalies(name, year), 5000);
  }

  async getAnomaly(id: number): Promise<AnomalyDetailResponse> {
    return this.fetchWithFallback(`/anomalies/${id}`, this.getMockAnomaly(id), 5000);
  }

  async getTreeCart(): Promise<{ user_id: number; item_count: number }> {
    return this.fetchWithFallback(
      '/trees/cart', 
      { user_id: -1, item_count: 0 }, 
      5000
    );
  }

  private getMockAnomalies(name?: string, year?: string): AnomaliesListResponse {
    let filteredAnomalies = mockAnomalies;
    
    if (name || year) {
      filteredAnomalies = mockAnomalies.filter(anomaly => {
        const nameMatch = name ? anomaly.name.toLowerCase().includes(name.toLowerCase()) : false;
        const yearMatch = year ? anomaly.year.toString().includes(year) : false;
        return nameMatch || yearMatch;
      });
    }
    
    return { anomalies: filteredAnomalies };
  }

  private getMockAnomaly(id: number): AnomalyDetailResponse {
    return mockAnomalies.find(a => a.id === id) || mockAnomalies[0];
  }
}

export const apiService = new ApiService();
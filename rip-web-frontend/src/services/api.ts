import type { 
  Anomaly, 
  AnomaliesListResponse, 
  AnomalyDetailResponse,  
} from '../types';

const API_BASE_URL = '/api';

// Mock данные
const mockAnomalies: Anomaly[] = [
  {
    id: 1,
    name: "Извержение вулкана Уайнапутина",
    description: "На срезе дерева, жившего в 1600 году, хорошо заметно одно очень узкое и темное годовое кольцо. Оно резко контрастирует с более широкими светлыми кольцами до и после него. Это кольцо 1601 года.",
    image_url: "/images/mock/main-page.png",
    year: 1600 
  },
  {
    id: 2,
    name: "Извержение Тамбора", 
    description: "На срезе дерева хорошо видно три аномальных кольца старше. Такие кольца 1815 года характеризуются узкими, фрагментированными темными кольцами 1816 года и относительно широкими кольцами 1817 года.",
    image_url: "/images/mock/main-page.png",
    year: 1815
  },
  {
    id: 3,
    name: "Извержение Каракатау",
    description: "На срезе дерева, примерно на 15-16 кольцах от края, видны аномальные кольца второго следования 1884 года, например фрагментированное кольцо 1883 года и относительно широкими кольцами 1882 года.",
    image_url: "/images/mock/main-page.png", 
    year: 1883
  }
];


class ApiService {
  private async fetchWithFallback<T>(endpoint: string, mockData: T): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error('API not available');
      return await response.json();
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return mockData;
    }
  }

  async getAnomalies(name?: string, year?: string): Promise<AnomaliesListResponse> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    const endpoint = `/anomalies${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithFallback(endpoint, { anomalies: mockAnomalies });
  }

  async getAnomaly(id: number): Promise<AnomalyDetailResponse> {
    const anomaly = mockAnomalies.find(a => a.id === id) || mockAnomalies[0];
    return this.fetchWithFallback(`/anomalies/${id}`, anomaly);
  }

}

export const apiService = new ApiService();
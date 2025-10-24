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
    description: "Необычный паттерн роста древесных колец в 2023 году",
    image_url: "/images/mock/main-page.png",
    year: 1600 
  },
  {
    id: 2,
    name: "Извержение Тамбора", 
    description: "Влияние климатических изменений на структуру колец",
    image_url: "/images/mock/main-page.png",
    year: 1815
  },
  {
    id: 3,
    name: "Извержение Каракатау",
    description: "Характерные признаки засушливого периода в древесных кольцах",
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
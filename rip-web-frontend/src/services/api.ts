/*import type { 
  Anomaly, 
  AnomaliesListResponse, 
  AnomalyDetailResponse,  
} from '../types';

const API_BASE_URL = '/api';

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
  private async fetchWithTimeout<T>(endpoint: string, timeout = 500): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithFallback<T>(endpoint: string, mockData: T, timeout = 500): Promise<T> {
    try {
      return await this.fetchWithTimeout<T>(endpoint, timeout);
    } catch (error) {
      console.warn(`API ${endpoint} failed, using mock data:`, error);
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
    
    return this.fetchWithFallback(endpoint, this.getMockAnomalies(name, year), 500);
  }

  async getAnomaly(id: number): Promise<AnomalyDetailResponse> {
    return this.fetchWithFallback(`/anomalies/${id}`, this.getMockAnomaly(id), 500);
  }

  async getTreeCart(): Promise<{ user_id: number; item_count: number }> {
    return this.fetchWithFallback(
      '/trees/cart', 
      { user_id: -1, item_count: 0 }, 
      300
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

    // НОВЫЕ МЕТОДЫ ДЛЯ АВТОРИЗАЦИИ
  async login(credentials: { login: string; password: string }) {
    return this.fetchWithFallback('/users/login', {
      message: "Успешная аутентификация",
      token: "mock-jwt-token",
      user: {
        id: 1,
        login: credentials.login,
        is_moderator: false
      }
    }, 500);
  }

  async register(userData: { login: string; password: string }) {
    return this.fetchWithFallback('/users/register', {
      id: 2,
      login: userData.login,
      is_moderator: false
    }, 500);
  }

  async logout() {
    return this.fetchWithFallback('/users/logout', {
      message: "Успешный выход из системы"
    }, 500);
  }

  async getCurrentUser() {
    return this.fetchWithFallback('/users/me', {
      id: 1,
      login: "research_user",
      is_moderator: false
    }, 500);
  }

  // НОВЫЕ МЕТОДЫ ДЛЯ ЗАЯВОК
  async getUserRequests() {
    return this.fetchWithFallback('/trees', {
      trees: [
        {
          id: 1,
          creator: "research_user",
          amount_of_anomalies: 3,
          final_year: 2023,
          status: "черновик"
        }
      ]
    }, 500);
  }

  async getTreeDetail(treeId: number) {
    return this.fetchWithFallback(`/trees/${treeId}`, {
      tree: {
        id: treeId,
        description: "Исследование аномалий роста",
        total_rings: 100,
        final_year: 2023,
        status: "черновик",
        creator_id: 1
      },
      treeItems: [
        {
          anomaly_id: 1,
          anomaly_name: "Извержение вулкана Уайнапутина",
          anomaly_image: "/RIP-WEB-frontend/images/mock/main-page.png",
          anomalous_rings: "45,67,89",
          calculated_year: 2023
        }
      ]
    }, 500);
  }

  async addToTree(anomalyId: number) {
    return this.fetchWithFallback('/trees/current/items', {
      message: "Аномалия добавлена в заявку",
      tree_id: 1
    }, 500);
  }

}

export const apiService = new ApiService();
*/

// types/index.ts
// Re-export types from generated API
export type {
  HandlerAnomalyShortResponse as AnomalyShortResponse,
  HandlerAnomalyDetailResponse as AnomalyDetailResponse,
  HandlerAnomaliesListResponse as AnomaliesListResponse,
  //HandlerTreeShortResponse as TreeShortResponse, // УДАЛИТЬ этот re-export если создаем свой
  HandlerTreeDetailResponse as TreeDetailResponse,
  HandlerTreeResponse as TreeResponse,
  HandlerTreeItemResponse as TreeItemResponse,
  HandlerTreesListResponse as TreesListResponse,
  HandlerTreeCartResponse as TreeCartResponse,
  HandlerUserResponse as UserResponse,
  HandlerLoginRequest as LoginRequest,
  HandlerRegisterRequest as RegisterRequest,
  HandlerLoginResponse as LoginResponse,
  HandlerAddToTreeRequest as AddToTreeRequest,
  HandlerUpdateTreeItemRequest as UpdateTreeItemRequest,
  HandlerUpdateTreeRequest as UpdateTreeRequest,
  HandlerCompleteTreeRequest as CompleteTreeRequest,
} from '../api/Api';

// Additional types for Redux state
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface SearchState {
  searchTerm: string;
  searchYear: string;
  filters: {
    yearFrom?: string;
    yearTo?: string;
    type?: string;
  };
  recentSearches: string[];
}

// Расширенный интерфейс для TreeShortResponse с дополнительными полями
export interface TreeShortResponse {
  id?: number;
  amount_of_anomalies?: number;
  creator?: string;
  moderator?: string;
  final_year?: number;
  status?: string;
  completed_anomalies?: number;
}
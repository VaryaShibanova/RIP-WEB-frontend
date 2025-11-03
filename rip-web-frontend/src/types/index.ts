export interface Anomaly {
  id: number;
  name: string;
  description: string;
  image_url: string;
  year: number;
}

export interface AnomaliesListResponse {
  anomalies: AnomalyShortResponse[];
}

export interface AnomalyShortResponse {
  id: number;
  name: string;
  image_url: string;
  year: number;
}

export interface AnomalyDetailResponse {
  id: number;
  name: string;
  description: string;
  image_url: string;
  year: number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface TreeItem {
  anomaly_id: number;
  anomaly_name: string;
  anomaly_image: string;
  anomalous_rings: string;
  calculated_year: number;
}

export interface TreeDetailResponse {
  tree: {
    id: number;
    description: string;
    total_rings: number;
    final_year: number;
    status: string;
    creator_id: number;
  };
  treeItems: TreeItem[];
}

export interface AnomalyShortResponse {
  id: number;
  name: string;
  image_url: string;
  year: number;
}


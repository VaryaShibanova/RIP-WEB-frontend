import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import type { AnomalyShortResponse } from '../types';
import { apiService } from '../services/api';
import AnomalyCard from '../components/AnomalyCard';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyShortResponse[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<AnomalyShortResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    year: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadAnomalies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [anomalies, filters]);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnomalies();
      setAnomalies(response.anomalies);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = anomalies;

    if (filters.name) {
      filtered = filtered.filter(anomaly =>
        anomaly.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.year) {
      filtered = filtered.filter(anomaly =>
        anomaly.year.toString().includes(filters.year)
      );
    }

    setFilteredAnomalies(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnomalies(filters.name, filters.year);
      setAnomalies(response.anomalies);
    } catch (error) {
      console.error('Error searching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/anomalies/${id}`);
  };

  if (loading) {
  return (
    <Container className="page-container">
      <LoadingSpinner size="lg" text="Загрузка аномалий..." />
    </Container>
  );
}

  return (
    <Container className="page-container">
      <div className="breadcrumbs-container">
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Аномальные паттерны' }
        ]} />
      </div>

      <h1 className="page-title">аномальные паттерны в дендрошкале</h1>

      {/* Поиск и фильтры */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              className="search-input-field" 
              placeholder="Поиск..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              <img 
                src="/images/mock/search-icon.png" 
                alt="Поиск" 
              />
            </button>
          </div>

          {/* Иконка корзины - ПРОСТО НЕАКТИВНАЯ БЕЗ JS */}
          <div className="tree-icon disabled" title="Корзина временно недоступна">
            <img 
              src="/images/mock/user-icon.jpg" 
              alt="Заявка" 
              className="grayscale"
            />
            {/*<span className="tree-count disabled">0</span>*/}
          </div>
        </div>
      </div>

      {/* Сетка карточек */}
      <div className="anomalies-grid">
        {filteredAnomalies.map(anomaly => (
          <AnomalyCard 
            key={anomaly.id}
            anomaly={anomaly} 
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredAnomalies.length === 0 && (
        <div className="text-center" style={{ color: 'white', padding: '50px' }}>
          <p>Аномалии не найдены. Попробуйте изменить параметры поиска.</p>
        </div>
      )}
    </Container>
  );
};

export default AnomaliesPage;
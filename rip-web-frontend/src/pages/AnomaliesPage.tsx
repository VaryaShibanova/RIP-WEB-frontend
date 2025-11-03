// AnomaliesPage.tsx - упрощаем работу с корзиной
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadAnomalies();
    // Временно добавить для теста
    apiService.getTreeCart().then(cart => {
      console.log('Cart data:', cart);
    });
  }, []);

  const loadAnomalies = async (searchName?: string, searchYear?: string) => {
    try {
      setLoading(true);
      const response = await apiService.getAnomalies(searchName, searchYear);
      setAnomalies(response.anomalies);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadAnomalies();
      return;
    }

    await loadAnomalies(searchTerm.trim(), searchTerm.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-button" onClick={handleSearch}>
              <img 
                src="/images/mock/search-icon.png" 
                alt="Поиск" 
              />
            </button>
          </div>

          {/* Корзина остается серой и не кликабельной */}
          <div className="tree-icon disabled" title="Корзина временно недоступна">
            <img 
              src="/images/mock/user-icon.jpg" 
              alt="Заявка" 
              className="grayscale"
            />
          </div>
        </div>
      </div>

      {/* Сетка карточек */}
      <div className="anomalies-grid">
        {anomalies.map(anomaly => (
          <AnomalyCard 
            key={anomaly.id}
            anomaly={anomaly} 
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {anomalies.length === 0 && (
        <div className="text-center" style={{ color: 'white', padding: '50px' }}>
          <p>Аномалии не найдены. Попробуйте изменить параметры поиска.</p>
        </div>
      )}
    </Container>
  );
};

export default AnomaliesPage;
import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import type { AnomalyShortResponse } from '../types';
import { apiService } from '../services/api';
import AnomalyCard from '../components/AnomalyCard';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useCart } from '../hooks/useCart';
import searchIcon from '/images/mock/search-icon.png';
import userIcon from '/images/mock/user-icon.jpg';

const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyShortResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    searchTerm, 
    updateSearchTerm, 
    saveSearchToHistory
  } = useSearch();
  
  // Убрали неиспользуемый itemCount
  const { syncCartWithApi } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Автоматически применяем сохраненный поиск и синхронизируем корзину
    loadAnomaliesWithCurrentSearch();
    syncCartWithApi();
  }, []);

  const loadAnomaliesWithCurrentSearch = async () => {
    if (searchTerm.trim()) {
      await loadAnomalies(searchTerm.trim(), searchTerm.trim());
    } else {
      await loadAnomalies();
    }
  };

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

    saveSearchToHistory(searchTerm);
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
              onChange={(e) => updateSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-button" onClick={handleSearch}>
              <img src={searchIcon} alt="Поиск" />
            </button>
          </div>

          {/* Корзина остается серой и не кликабельной */}
          <div className="tree-icon disabled" title="Корзина временно недоступна">
            <img 
              src={userIcon} 
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
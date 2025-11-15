import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import type { AnomalyShortResponse } from '../types';
import { api } from '../api';
import AnomalyCard from '../components/AnomalyCard';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import searchIcon from '/images/mock/search-icon.png';
import userIcon from '/images/mock/user-icon.jpg';

const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyShortResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftTreeId, setDraftTreeId] = useState<number | null>(null);
  
  const { 
    searchTerm, 
    updateSearchTerm, 
    saveSearchToHistory
  } = useSearch();
  
  const { syncCartWithApi, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnomaliesWithCurrentSearch();
    if (isAuthenticated) {
      syncCartWithApi();
      loadUserDraftTree();
    }
  }, [isAuthenticated]);

  const loadUserDraftTree = async () => {
    try {
      // Загружаем заявки пользователя чтобы найти черновик
      const response = await api.api.treesList();
      const draft = response.data.trees?.find(tree => tree.status === 'черновик');
      if (draft) {
        setDraftTreeId(draft.id!);
      }
    } catch (error) {
      console.error('Error loading draft tree:', error);
    }
  };

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
      const response = await api.api.anomaliesList({ name: searchName, year: searchYear });
      setAnomalies(response.data.anomalies || []);
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

  // ПЕРЕХОД ТОЛЬКО НА ДЕТАЛЬНУЮ СТРАНИЦУ ЗАЯВКИ (ЧЕРНОВИКА)
  const handleCartClick = () => {
    if (isAuthenticated) {
      if (draftTreeId) {
        // Переходим на детальную страницу существующего черновика
        navigate(`/trees/${draftTreeId}`);
      } else {
        // Если черновика нет, создаем новый и переходим на его детальную страницу
        navigate('/trees/new'); // или другая логика создания
      }
    } else {
      navigate('/login');
    }
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
          
          {/* Иконка корзины - переход ТОЛЬКО на детальную страницу заявки */}
          <div className="tree-icon-container">
            <div 
              className={`tree-icon ${!isAuthenticated ? 'disabled' : ''}`}
              onClick={handleCartClick}
              title={isAuthenticated ? 
                (draftTreeId ? "Моя заявка (черновик)" : "Создать новую заявку") 
                : "Войдите для доступа к заявке"}
            >
              <img 
                src={userIcon} 
                alt="Моя заявка" 
                className={!isAuthenticated ? "grayscale" : ""}
              />
              {isAuthenticated && itemCount > 0 && (
                <div className="tree-count">
                  {itemCount > 9 ? '9+' : itemCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
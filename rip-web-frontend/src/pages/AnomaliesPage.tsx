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
  const [draftTree, setDraftTree] = useState<any>(null);
  const [treesLoading, setTreesLoading] = useState(false);
  
  const { 
    searchTerm, 
    updateSearchTerm, 
    saveSearchToHistory 
  } = useSearch();
  
  const { syncCartWithApi, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const isModerator = user?.is_moderator === true;

  useEffect(() => {
    loadAnomaliesWithCurrentSearch();
    if (isAuthenticated && !isModerator) {
      syncCartWithApi();
      loadUserTrees();
    }
  }, [isAuthenticated, isModerator]);

  // Обновляем список заявок при изменении корзины
  useEffect(() => {
    if (isAuthenticated && !isModerator && itemCount > 0) {
      loadUserTrees();
    }
  }, [itemCount, isAuthenticated, isModerator]);

  const loadUserTrees = async () => {
    try {
      setTreesLoading(true);
      const response = await api.api.treesList();
      const trees = response.data.trees || [];
      
      const draft = trees.find(tree => tree.status === 'черновик');
      setDraftTree(draft || null);
      
      console.log('📋 Загружены заявки пользователя:', trees);
      console.log('📝 Черновик:', draft);
    } catch (error) {
      console.error('Error loading user trees:', error);
      setDraftTree(null);
    } finally {
      setTreesLoading(false);
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

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ - без использования treesCreate
  const handleCartClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isModerator) {
      console.log('🚫 Модераторам запрещено создавать заявки');
      return;
    }

    if (treesLoading) {
      console.log('⏳ Заявки еще загружаются...');
      return;
    }

    // Если есть черновик - открываем его
    if (draftTree) {
      console.log('📂 Открываем существующий черновик:', draftTree.id);
      navigate(`/trees/${draftTree.id}`);
    } else {
      // Если черновика нет, но есть аномалии в корзине - переходим на страницу заявок
      if (itemCount > 0) {
        console.log('🛒 Есть аномалии в корзине, переходим к заявкам');
        navigate('/trees');
      } else {
        // Если корзина пустая - тоже переходим на страницу заявок
        console.log('📝 Переходим к созданию заявки');
        navigate('/trees');
      }
    }
  };

  // Иконка активна если есть черновик ИЛИ есть аномалии в корзине
  const isCartActive = isAuthenticated && !isModerator && !treesLoading && (draftTree || itemCount > 0);

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
          
          {/* Иконка корзины */}
          <div className="tree-icon-container">
            <div 
              className={`tree-icon ${!isCartActive ? 'disabled' : ''}`}
              onClick={handleCartClick}
              title={
                isModerator 
                  ? "Модераторам запрещено создавать заявки" 
                  : !isAuthenticated 
                    ? "Войдите для доступа к заявке" 
                    : treesLoading 
                      ? "Загрузка заявок..." 
                      : draftTree 
                        ? "Моя заявка (черновик)" 
                        : itemCount > 0
                          ? "Перейти к созданию заявки"
                          : "Создать новую заявку"
              }
            >
              <img 
                src={userIcon} 
                alt="Моя заявка" 
                className={!isCartActive ? "grayscale" : ""}
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
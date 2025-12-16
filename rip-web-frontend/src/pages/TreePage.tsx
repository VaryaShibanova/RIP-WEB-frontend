import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserTrees, fetchModeratorTrees, completeTree } from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const TreePage: React.FC = () => {
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [displayFilters, setDisplayFilters] = useState({
    status: '',
    dateFrom: getCurrentDate(),
    dateTo: getCurrentDate(),
    creator: ''
  });
  
  const [realFilters, setRealFilters] = useState({
    dateFrom: getCurrentDate(),
    dateTo: getTomorrowDate()
  });
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { trees, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);

  const isModerator = user?.is_moderator;
  const pollingRef = useRef<number | null>(null);

  const loadTrees = useCallback(() => {
    const apiFilters: any = {};
    
    if (displayFilters.status) apiFilters.status = displayFilters.status;
    if (realFilters.dateFrom) apiFilters.date_from = realFilters.dateFrom;
    if (realFilters.dateTo) apiFilters.date_to = realFilters.dateTo;
    
    if (displayFilters.creator) apiFilters.creator = displayFilters.creator;

    if (isModerator) {
      dispatch(fetchModeratorTrees(apiFilters));
    } else {
      dispatch(fetchUserTrees(apiFilters));
    }
  }, [displayFilters, realFilters, isModerator, dispatch]);

  useEffect(() => {
    loadTrees();
    
    if (isModerator) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      
      pollingRef.current = window.setInterval(() => {
        loadTrees();
      }, 5000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [loadTrees, isModerator]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setDisplayFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'dateFrom') {
      setRealFilters(prev => ({ ...prev, dateFrom: value }));
    }
    
    if (key === 'dateTo') {
      const date = new Date(value);
      date.setDate(date.getDate() + 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const nextDay = `${year}-${month}-${day}`;
      setRealFilters(prev => ({ ...prev, dateTo: nextDay }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setDisplayFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      creator: ''
    });
    setRealFilters({
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  const handleSetToday = useCallback(() => {
    const today = getCurrentDate();
    const tomorrow = getTomorrowDate();
    
    setDisplayFilters(prev => ({
      ...prev,
      dateFrom: today,
      dateTo: today
    }));
    setRealFilters({
      dateFrom: today,
      dateTo: tomorrow
    });
  }, []);

  useEffect(() => {
    handleSetToday();
  }, []);

  const filteredTrees = (isModerator 
    ? trees.filter(tree => {
        if (tree.status === 'черновик') return false;
        if (!displayFilters.creator) return true;
        return tree.creator?.toLowerCase().includes(displayFilters.creator.toLowerCase());
      })
    : trees.filter(tree => tree.status !== 'черновик')
  );

  const uniqueCreators = isModerator 
    ? Array.from(new Set(
        trees
          .filter(tree => tree.status !== 'черновик')
          .map(tree => tree.creator)
          .filter(Boolean)
      )) as string[]
    : [];

  const handleCompleteTree = async (treeId: number, action: 'complete' | 'reject') => {
    try {
      await dispatch(completeTree({
        treeId,
        action
      })).unwrap();
      loadTrees();
    } catch (error) {
      console.error('Error completing tree:', error);
    }
  };

  const handleViewDetails = (treeId: number) => {
    navigate(`/trees/${treeId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'сформирован': return '#FFC107'; // желтый
      case 'завершён': return '#28A745'; // зеленый
      case 'отклонён': return '#DC3545'; // красный
      default: return '#6C757D'; // серый
    }
  };

  if (isLoading && trees.length === 0) {
    return <LoadingSpinner text="Загрузка заявок..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: isModerator ? 'Все заявки' : 'Мои заявки' }
      ]} />

      <div className="page-content-with-margin">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="tree-page-title">{isModerator ? 'Все заявки' : 'Мои заявки на исследование'}</h1>
        </div>

        {/* ФИЛЬТРЫ */}
        <Card className="mb-4 tree-filters-card">
          <Card.Header className="tree-filters-header">
            <span className="tree-filters-title">Фильтры заявок</span>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label className="tree-filter-label">Статус заявки</Form.Label>
                  <Form.Select
                    value={displayFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="tree-filter-select"
                  >
                    <option value="">Все статусы</option>
                    <option value="сформирован">Сформирован</option>
                    <option value="завершён">Завершён</option>
                    <option value="отклонён">Отклонён</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label className="tree-filter-label">Дата от</Form.Label>
                  <Form.Control
                    type="date"
                    value={displayFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="tree-filter-input"
                  />
                </Form.Group>
              </Col>
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label className="tree-filter-label">Дата до</Form.Label>
                  <Form.Control
                    type="date"
                    value={displayFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="tree-filter-input"
                  />
                </Form.Group>
              </Col>

              {isModerator && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="tree-filter-label">Создатель</Form.Label>
                    <Form.Select
                      value={displayFilters.creator}
                      onChange={(e) => handleFilterChange('creator', e.target.value)}
                      className="tree-filter-select"
                    >
                      <option value="">Все создатели</option>
                      {uniqueCreators.map(creator => (
                        <option key={creator} value={creator}>{creator}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 tree-filters-footer">
              <div className="tree-filter-info">
                <span className="tree-filter-count">Показано: <strong>{filteredTrees.length}</strong> заявок</span>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleSetToday}
                  className="tree-filter-button"
                >
                  Показать сегодня
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="tree-filter-button"
                >
                  Очистить фильтры
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {error && (
          <div className="alert alert-danger tree-error-alert" role="alert">
            {error}
          </div>
        )}

        {/* КАРТОЧКИ ЗАЯВОК */}
        <div className="tree-cards-container">
          {filteredTrees.length === 0 ? (
            <div className="tree-no-results">
              <h4 className="tree-no-results-title">
                {trees.length === 0 ? 'Заявки не найдены' : 'Заявки не найдены по выбранным фильтрам'}
              </h4>
              <p className="tree-no-results-text">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          ) : (
            <div className="tree-cards-vertical">
              {filteredTrees.map((tree) => (
                <Card 
                  key={tree.id} 
                  className="tree-request-card"
                  onClick={() => handleViewDetails(tree.id!)}
                >
                  <Card.Body className="tree-card-body">
                    {/* ГОРИЗОНТАЛЬНАЯ СТРОКА В КАРТОЧКЕ */}
                    <div className="tree-card-horizontal-row">
                      {/* Статус */}
                      <div className="tree-card-column">
                        <div className="tree-card-label">Статус</div>
                        <div 
                          className="tree-status-badge" 
                          style={{ backgroundColor: getStatusColor(tree.status || 'черновик') }}
                        >
                          {tree.status || 'черновик'}
                        </div>
                      </div>

                      {/* Количество аномалий */}
                      <div className="tree-card-column">
                        <div className="tree-card-label">Количество аномалий</div>
                        <div className="tree-card-value tree-anomalies-count">
                          {tree.amount_of_anomalies || 0}
                        </div>
                      </div>

                      {/* Финальный год */}
                      <div className="tree-card-column">
                        <div className="tree-card-label">Финальный год</div>
                        <div className="tree-card-value tree-final-year">
                          {tree.final_year ? `${tree.final_year} г.` : 'Не рассчитан'}
                        </div>
                      </div>

                      {/* Создатель (только для модератора) */}
                      {isModerator && (
                        <div className="tree-card-column">
                          <div className="tree-card-label">Создатель</div>
                          <div className="tree-card-value tree-creator">
                            {tree.creator || 'Неизвестно'}
                          </div>
                        </div>
                      )}

                      {/* Модератор (только для модератора) */}
                      {isModerator && (
                        <div className="tree-card-column">
                          <div className="tree-card-label">Модератор</div>
                          <div className="tree-card-value tree-moderator">
                            {tree.moderator || 'Не назначен'}
                          </div>
                        </div>
                      )}

                      {/* Кнопки для модератора */}
                      {isModerator && tree.status === 'сформирован' && (
                        <div className="tree-card-column tree-actions-column">
                          <div className="tree-card-label">Действия</div>
                          <div className="tree-card-actions-vertical">
                            <Button
                              variant="primary"
                              size="sm"
                              className="tree-complete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTree(tree.id!, 'complete');
                              }}
                            >
                              Завершить
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="tree-reject-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTree(tree.id!, 'reject');
                              }}
                            >
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default TreePage;
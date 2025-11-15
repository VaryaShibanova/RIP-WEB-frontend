import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Table, Button, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserTrees, fetchModeratorTrees, completeTree } from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const TreePage: React.FC = () => {
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    creator: ''
  });
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { trees, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);

  const isModerator = user?.is_moderator;
  const pollingRef = useRef<number | null>(null);

  // useCallback чтобы функция не пересоздавалась при каждом рендере
  const loadTrees = useCallback(() => {
    const apiFilters: any = {};
    
    if (filters.status) apiFilters.status = filters.status;
    if (filters.dateFrom) apiFilters.date_from = filters.dateFrom;
    if (filters.dateTo) apiFilters.date_to = filters.dateTo;

    if (isModerator) {
      dispatch(fetchModeratorTrees(apiFilters));
    } else {
      dispatch(fetchUserTrees(apiFilters));
    }
  }, [filters, isModerator, dispatch]);

  // Short polling только для модератора
  useEffect(() => {
    loadTrees(); // Первоначальная загрузка
    
    if (isModerator) {
      // Очищаем предыдущий интервал
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      
      // Запускаем новый интервал
      pollingRef.current = window.setInterval(() => {
        loadTrees();
      }, 5000); // 5 секунд

      // Очистка при размонтировании
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [loadTrees, isModerator]); // Зависимости: loadTrees и isModerator

  // Обработчики фильтров с useCallback
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      creator: ''
    });
  }, []);

  // Фильтрация по создателю на фронтенде ТОЛЬКО для модератора
  const filteredTrees = isModerator 
    ? trees.filter(tree => {
        if (!filters.creator) return true;
        return tree.creator?.toLowerCase().includes(filters.creator.toLowerCase());
      })
    : trees;

  // Уникальные создатели для фильтра (только для модератора)
  const uniqueCreators = isModerator 
    ? Array.from(new Set(trees.map(tree => tree.creator).filter(Boolean))) as string[]
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'черновик': return 'secondary';
      case 'сформирован': return 'warning';
      case 'завершён': return 'success';
      case 'отклонён': return 'danger';
      default: return 'secondary';
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
          <h1>{isModerator ? 'Все заявки' : 'Мои заявки на исследование'}</h1>
          {/*isModerator && (
             <Badge bg="info" className="polling-badge">
              Auto-update: {pollingCount}
            </Badge> 
          )*/}
        </div>

        {/* ФИЛЬТРЫ ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              {/* СТАТУС - ДЛЯ ВСЕХ */}
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label><strong>Статус заявки</strong></Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Все статусы</option>
                    <option value="черновик">Черновик</option>
                    <option value="сформирован">Сформирован</option>
                    <option value="завершён">Завершён</option>
                    <option value="отклонён">Отклонён</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* ДАТЫ - ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ */}
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label><strong>Дата от</strong></Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label><strong>Дата до</strong></Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* СОЗДАТЕЛЬ - ТОЛЬКО ДЛЯ МОДЕРАТОРА */}
              {isModerator && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label><strong>Создатель</strong></Form.Label>
                    <Form.Select
                      value={filters.creator}
                      onChange={(e) => handleFilterChange('creator', e.target.value)}
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
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Form.Text className="text-muted">
                Показано: {filteredTrees.length} заявок
                {isModerator && ' • Автообновление каждые 5 секунд'}
              </Form.Text>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleClearFilters}
              >
                Очистить фильтры
              </Button>
            </div>
          </Card.Body>
        </Card>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Table striped bordered hover responsive className="bg-dark">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Статус</th>
              <th>Количество аномалий</th>
              <th>Финальный год</th>
              {isModerator && <th>Создатель</th>}
              {isModerator && <th>Модератор</th>}
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrees.length === 0 ? (
              <tr>
                <td colSpan={isModerator ? 7 : 5} className="text-center py-4">
                  {trees.length === 0 ? 'Заявки не найдены' : 'Заявки не найдены по выбранным фильтрам'}
                </td>
              </tr>
            ) : (
              filteredTrees.map((tree) => (
                <tr key={tree.id}>
                  <td>
                    <strong>#{tree.id}</strong>
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(tree.status || 'черновик')}>
                      {tree.status || 'черновик'}
                    </Badge>
                  </td>
                  <td>
                    <span className="anomalies-count">
                      {tree.amount_of_anomalies || 0}
                    </span>
                  </td>
                  <td>
                    <span className="final-year">
                      {tree.final_year ? `${tree.final_year} г.` : 'Не рассчитан'}
                    </span>
                  </td>
                  {isModerator && (
                    <>
                      <td>
                        <span className="creator">
                          {tree.creator || 'Неизвестно'}
                        </span>
                      </td>
                      <td>
                        <span className="moderator">
                          {tree.moderator || 'Не назначен'}
                        </span>
                      </td>
                    </>
                  )}
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleViewDetails(tree.id!)}
                        variant="outline-primary"
                        size="sm"
                      >
                        Просмотреть
                      </Button>
                      {isModerator && tree.status === 'сформирован' && (
                        <>
                          <Button
                            onClick={() => handleCompleteTree(tree.id!, 'complete')}
                            variant="outline-success"
                            size="sm"
                          >
                            ✅ Завершить
                          </Button>
                          <Button
                            onClick={() => handleCompleteTree(tree.id!, 'reject')}
                            variant="outline-danger"
                            size="sm"
                          >
                            ❌ Отклонить
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default TreePage;
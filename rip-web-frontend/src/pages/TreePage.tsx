// TreePage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserTrees } from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const TreePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [anomaliesFilter, setAnomaliesFilter] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { trees, isLoading, error } = useAppSelector((state) => state.trees);

  useEffect(() => {
    dispatch(fetchUserTrees());
  }, [dispatch]);

  const handleCreateNewTree = () => {
    navigate('/anomalies');
  };

  // Простая фильтрация с отладкой
  const filteredTrees = trees.filter(tree => {
    // Фильтр по статусу
    if (statusFilter) {
      // Приводим оба значения к нижнему регистру для сравнения
      const treeStatus = (tree.status || '').toLowerCase().trim();
      const filterStatus = statusFilter.toLowerCase().trim();
      
      if (treeStatus !== filterStatus) {
        return false;
      }
    }
    
    // Фильтр по количеству аномалий
    if (anomaliesFilter) {
      const count = tree.amount_of_anomalies || 0;
      switch (anomaliesFilter) {
        case '1-5':
          return count >= 1 && count <= 5;
        case '6-10':
          return count >= 6 && count <= 10;
        case '10+':
          return count > 10;
        default:
          return true;
      }
    }
    
    return true;
  });

  // Для отладки - выводим в консоль
  useEffect(() => {
    console.log('Все заявки:', trees);
    console.log('Статусы:', trees.map(t => t.status));
    console.log('Фильтр статуса:', statusFilter);
    console.log('Отфильтровано:', filteredTrees.length);
  }, [trees, statusFilter, filteredTrees]);

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заявок..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Мои заявки' }
      ]} />

      <div className="page-content-with-margin">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Мои заявки на исследование</h1>
          <Button 
            onClick={handleCreateNewTree}
            variant="primary"
            className="btn-custom-primary"
          >
            Создать новую заявку
          </Button>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Статус заявки</strong></Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Все статусы</option>
                    <option value="черновик">Черновик</option>
                    <option value="сформирован">Сформирован</option>
                    <option value="завершён">Завершён</option>
                    <option value="отклонён">Отклонён</option>
                    <option value="удалён">Удалён</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Найдено заявок: {filteredTrees.length} из {trees.length}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Количество аномалий</strong></Form.Label>
                  <Form.Select
                    value={anomaliesFilter}
                    onChange={(e) => setAnomaliesFilter(e.target.value)}
                  >
                    <option value="">Любое количество</option>
                    <option value="1-5">1-5 аномалий</option>
                    <option value="6-10">6-10 аномалий</option>
                    <option value="10+">Более 10 аномалий</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
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
              <th>Статус</th>
              <th>Количество аномалий</th>
              <th>Финальный год</th>
              <th>Модератор</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrees.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  {trees.length === 0 ? 'У вас пока нет заявок' : 'Заявки не найдены по выбранным фильтрам'}
                  {statusFilter && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Текущий фильтр: "{statusFilter}"
                        <br />
                        Доступные статусы: {Array.from(new Set(trees.map(t => t.status || 'черновик'))).join(', ')}
                      </small>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredTrees.map((tree) => (
                <tr key={tree.id}>
                  <td>
                    <span className="status-text">
                      {tree.status || 'черновик'}
                    </span>
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
                  <td>
                    <span className="moderator">
                      {tree.moderator || 'Не назначен'}
                    </span>
                  </td>
                  <td>
                    <Button
                      onClick={() => navigate(`/trees/${tree.id}`)}
                      variant="outline-primary"
                      size="sm"
                    >
                      {tree.status === 'черновик' ? 'Продолжить' : 'Просмотреть'}
                    </Button>
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
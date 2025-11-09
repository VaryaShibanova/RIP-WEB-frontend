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

  const filteredTrees = trees.filter(tree => {
    // Фильтрация по статусу
    if (statusFilter && tree.status !== statusFilter) return false;
    
    // Фильтрация по количеству аномалий
    if (anomaliesFilter) {
      const anomaliesCount = tree.amount_of_anomalies || 0;
      switch (anomaliesFilter) {
        case '1-5':
          return anomaliesCount >= 1 && anomaliesCount <= 5;
        case '6-10':
          return anomaliesCount >= 6 && anomaliesCount <= 10;
        case '10+':
          return anomaliesCount > 10;
        default:
          return true;
      }
    }
    
    return true;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'черновик': return 'Черновик';
      case 'сформирован': return 'Сформирован';
      case 'завершён': return 'Завершён';
      case 'отклонён': return 'Отклонён';
      case 'удалён': return 'Удалён';
      default: return status || 'Черновик';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заявок..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Мои заявки' }
      ]} />

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
                <Form.Label><strong>Статус</strong></Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Все статусы</option>
                  <option value="черновик">Черновик</option>
                  <option value="сформирован">Сформирован</option>
                  <option value="завершён">Завершён</option>
                  <option value="отклонён">Отклонён</option>
                </Form.Select>
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
              </td>
            </tr>
          ) : (
            filteredTrees.map((tree) => (
              <tr key={tree.id}>
                <td>
                  <span className="status-text">
                    {getStatusText(tree.status || '')}
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
    </Container>
  );
};

export default TreePage;
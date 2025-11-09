import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserTrees } from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const TreePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const dispatch = useAppDispatch();
  const { trees, isLoading, error } = useAppSelector((state) => state.trees);

  useEffect(() => {
    dispatch(fetchUserTrees());
  }, [dispatch]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'черновик': return 'secondary';
      case 'сформирован': return 'warning';
      case 'завершён': return 'success';
      case 'отклонён': return 'danger';
      case 'удалён': return 'dark';
      default: return 'primary';
    }
  };

  const filteredTrees = trees.filter(tree => {
    if (statusFilter && tree.status !== statusFilter) return false;
    return true;
  });

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
          as={Link} 
          to="/anomalies" 
          variant="primary"
        >
          Создать новую заявку
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Статус</Form.Label>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>Дата от</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Дата до</Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
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

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
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
              <td colSpan={6} className="text-center py-4">
                {trees.length === 0 ? 'У вас пока нет заявок' : 'Заявки не найдены по выбранным фильтрам'}
              </td>
            </tr>
          ) : (
            filteredTrees.map((tree) => (
              <tr key={tree.id}>
                <td>#{tree.id}</td>
                <td>
                  <Badge bg={getStatusVariant(tree.status || '')}>
                    {tree.status || 'черновик'}
                  </Badge>
                </td>
                <td>{tree.amount_of_anomalies}</td>
                <td>
                  {tree.final_year || '-'}
                </td>
                <td>
                  {tree.moderator || '-'}
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/trees/${tree.id}`}
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
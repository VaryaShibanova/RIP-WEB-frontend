import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Badge, Form, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTreeById, 
  updateTreeItem, 
  removeFromTree, 
  submitTree,
  updateTree,
  deleteTree 
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [anomalousRings, setAnomalousRings] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [treeData, setTreeData] = useState({
    description: '',
    total_rings: 0,
    final_year: 0
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchTreeById(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTree?.tree) {
      setTreeData({
        description: currentTree.tree.description || '',
        total_rings: currentTree.tree.total_rings || 0,
        final_year: currentTree.tree.final_year || 0
      });
    }
  }, [currentTree]);

  const isDraft = currentTree?.tree?.status === 'черновик';
  const isOwner = currentTree?.tree?.creator_id === user?.id;

  const handleEditItem = (item: any) => {
    setEditingItem(item.anomaly_id!);
    setAnomalousRings(item.anomalous_rings || '');
  };

  const handleSaveItem = async (anomalyId: number) => {
    if (!id) return;
    
    try {
      await dispatch(updateTreeItem({
        treeId: parseInt(id),
        anomalyId,
        anomalousRings
      })).unwrap();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleRemoveItem = async (anomalyId: number) => {
    if (!id) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту аномалию из заявки?')) {
      try {
        await dispatch(removeFromTree({
          treeId: parseInt(id),
          anomalyId
        })).unwrap();
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  const handleSubmitTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(submitTree(parseInt(id))).unwrap();
      setShowSubmitModal(false);
      navigate('/trees');
    } catch (error) {
      console.error('Error submitting tree:', error);
    }
  };

  const handleUpdateTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: treeData
      })).unwrap();
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  };

  const handleDeleteTree = async () => {
    if (!id) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        await dispatch(deleteTree(parseInt(id))).unwrap();
        navigate('/trees');
      } catch (error) {
        console.error('Error deleting tree:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заявки..." />;
  }

  if (!currentTree) {
    return (
      <Container className="page-container">
        <div className="text-center">
          <h3>Заявка не найдена</h3>
          <Button onClick={() => navigate('/trees')} variant="primary">
            Вернуться к списку заявок
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Мои заявки', path: '/trees' },
        { label: `Заявка #${currentTree.tree?.id}` }
      ]} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Заявка на исследование #{currentTree.tree?.id}</h1>
          <Badge bg={
            currentTree.tree?.status === 'черновик' ? 'secondary' :
            currentTree.tree?.status === 'сформирован' ? 'warning' :
            currentTree.tree?.status === 'завершён' ? 'success' : 'primary'
          }>
            {currentTree.tree?.status}
          </Badge>
        </div>
        
        {isDraft && isOwner && (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary"
              onClick={() => navigate('/anomalies')}
            >
              Добавить аномалии
            </Button>
            <Button 
              variant="success"
              onClick={() => setShowSubmitModal(true)}
            >
              Сформировать заявку
            </Button>
            <Button 
              variant="danger"
              onClick={handleDeleteTree}
            >
              Удалить заявку
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Аномалии в заявке</h5>
            </Card.Header>
            <Card.Body>
              {(!currentTree.treeItems || currentTree.treeItems.length === 0) ? (
                <div className="text-center py-4">
                  <p>В заявке пока нет аномалий</p>
                  <Button onClick={() => navigate('/anomalies')} variant="primary">
                    Добавить аномалии из каталога
                  </Button>
                </div>
              ) : (
                currentTree.treeItems.map((item) => (
                  <Card key={item.anomaly_id} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <h6>{item.anomaly_name}</h6>
                          {editingItem === item.anomaly_id ? (
                            <Form.Group>
                              <Form.Label>Аномальные кольца</Form.Label>
                              <Form.Control
                                type="text"
                                value={anomalousRings}
                                onChange={(e) => setAnomalousRings(e.target.value)}
                                placeholder="Например: 45,67,89"
                              />
                              <Form.Text className="text-muted">
                                Введите номера колец через запятую
                              </Form.Text>
                            </Form.Group>
                          ) : (
                            <div>
                              <strong>Аномальные кольца:</strong>{' '}
                              {item.anomalous_rings || 'не указаны'}
                              {item.calculated_year! > 0 && (
                                <div>
                                  <strong>Рассчитанный год:</strong> {item.calculated_year}
                                </div>
                              )}
                            </div>
                          )}
                        </Col>
                        <Col md={4} className="text-end">
                          {isDraft && isOwner && (
                            <div className="d-flex gap-2 justify-content-end">
                              {editingItem === item.anomaly_id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleSaveItem(item.anomaly_id!)}
                                  >
                                    Сохранить
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setEditingItem(null)}
                                  >
                                    Отмена
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleEditItem(item)}
                                  >
                                    Редактировать
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleRemoveItem(item.anomaly_id!)}
                                  >
                                    Удалить
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Информация о заявке</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={treeData.description}
                  onChange={(e) => setTreeData({...treeData, description: e.target.value})}
                  readOnly={!isDraft || !isOwner}
                  placeholder="Описание исследования..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Общее количество колец</Form.Label>
                <Form.Control
                  type="number"
                  value={treeData.total_rings}
                  onChange={(e) => setTreeData({...treeData, total_rings: parseInt(e.target.value) || 0})}
                  readOnly={!isDraft || !isOwner}
                  placeholder="Введите количество колец"
                />
              </Form.Group>

              {currentTree.tree?.final_year! > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Финальный год</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentTree.tree?.final_year?.toString()}
                    readOnly
                  />
                </Form.Group>
              )}

              {isDraft && isOwner && (
                <Button 
                  variant="primary" 
                  onClick={handleUpdateTree}
                  className="w-100"
                >
                  Сохранить изменения
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Формирование заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите сформировать заявку?</p>
          <p className="text-muted">
            После формирования заявки вы не сможете редактировать её содержимое.
            Заявка будет отправлена на рассмотрение модератору.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleSubmitTree}>
            Сформировать заявку
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TreeDetailPage;
// TreeDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTreeById, 
  updateTree, 
  removeFromTree, 
  submitTree,
  deleteTree,
  updateTreeItem,
  addToTree
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import defaultImage from '/images/mock/main-page.png';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  
  const [treeData, setTreeData] = useState({
    description: '',
    total_rings: 0
  });

  const [editingFields, setEditingFields] = useState({
    description: false,
    total_rings: false
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
        total_rings: currentTree.tree.total_rings || 0
      });
    }
  }, [currentTree]);

  const isDraft = currentTree?.tree?.status === 'черновик';
  const isOwner = currentTree?.tree?.creator_id === user?.id;

  const handleUpdateTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: treeData.description,
          total_rings: treeData.total_rings
        }
      })).unwrap();
      setEditingFields({ description: false, total_rings: false });
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setTreeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item.anomaly_id!);
  };

  const handleSaveItem = async (anomalyId: number, anomalousRings: string) => {
    if (!id) return;
    
    try {
      await dispatch(updateTreeItem({
        treeId: parseInt(id),
        anomalyId,
        anomalousRings
      })).unwrap();
      setEditingItem(null);
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleRemoveItem = async (anomalyId: number) => {
    if (!id) return;
    
    try {
      await dispatch(removeFromTree({
        treeId: parseInt(id),
        anomalyId
      })).unwrap();
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error removing item:', error);
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

  const handleDeleteTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(deleteTree(parseInt(id))).unwrap();
      setShowDeleteModal(false);
      navigate('/trees');
    } catch (error) {
      console.error('Error deleting tree:', error);
    }
  };

  const handleClearTree = async () => {
    if (!id || !currentTree?.treeItems) return;
    
    try {
      // Удаляем все элементы заявки
      for (const item of currentTree.treeItems) {
        await dispatch(removeFromTree({
          treeId: parseInt(id),
          anomalyId: item.anomaly_id!
        })).unwrap();
      }
      setShowClearModal(false);
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error clearing tree:', error);
    }
  };

  const handleCreateNewTree = () => {
    navigate('/anomalies');
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
    <div className="tree-detail-page">
      <Container className="tree-detail-container">
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Мои заявки', path: '/trees' },
          { label: `Заявка #${currentTree.tree?.id}` }
        ]} />

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Общая информация о заявке */}
        <div className="request-general-info">
          <div className="general-info-card">
            <div className="info-header">
              <span className="info-label">ОПИСАНИЕ НАХОДКИ</span>
            </div>
            {isDraft && isOwner ? (
              <div className="editable-field-container">
                {editingFields.description ? (
                  <>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={treeData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Введите описание находки..."
                      className="info-value-editable"
                    />
                    <div className="editing-controls mt-2">
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleUpdateTree()}
                        className="me-2"
                      >
                        Сохранить
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => {
                          setTreeData({...treeData, description: currentTree.tree?.description || ''});
                          setEditingFields({...editingFields, description: false});
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </>
                ) : (
                  <div 
                    className="info-value-input clickable"
                    onClick={() => setEditingFields({...editingFields, description: true})}
                  >
                    {currentTree.tree?.description || 'Нажмите чтобы добавить описание...'}
                  </div>
                )}
              </div>
            ) : (
              <div className="info-value-input">
                {currentTree.tree?.description || 'Не указано'}
              </div>
            )}
          </div>
          
          <div className="general-info-card">
            <div className="info-header">
              <span className="info-label">ЧИСЛО ВСЕХ КОЛЕЦ</span>
            </div>
            {isDraft && isOwner ? (
              <div className="editable-field-container">
                {editingFields.total_rings ? (
                  <>
                    <Form.Control
                      type="number"
                      value={treeData.total_rings}
                      onChange={(e) => handleFieldChange('total_rings', parseInt(e.target.value) || 0)}
                      placeholder="Введите количество колец"
                      className="info-value-editable"
                      min="0"
                    />
                    <div className="editing-controls mt-2">
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleUpdateTree()}
                        className="me-2"
                      >
                        Сохранить
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => {
                          setTreeData({...treeData, total_rings: currentTree.tree?.total_rings || 0});
                          setEditingFields({...editingFields, total_rings: false});
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </>
                ) : (
                  <div 
                    className="info-value-input clickable"
                    onClick={() => setEditingFields({...editingFields, total_rings: true})}
                  >
                    {currentTree.tree?.total_rings || '0'} (нажмите чтобы изменить)
                  </div>
                )}
              </div>
            ) : (
              <div className="info-value-input">
                {currentTree.tree?.total_rings || '0'}
              </div>
            )}
          </div>
          
          <div className="general-info-card">
            <div className="info-header">
              <span className="info-label">ИТОГОВЫЙ ГОД</span>
            </div>
            <div className="info-value-input">
              {currentTree.tree?.final_year ? `${currentTree.tree.final_year} г.` : 'Не рассчитан'}
            </div>
          </div>
        </div>

        {/* Кнопки действий для черновика */}
        {isDraft && isOwner && (
          <Row className="mb-4">
            <Col>
              <div className="action-buttons-container">
                <Button 
                  onClick={() => navigate('/anomalies')} 
                  variant="primary"
                  className="action-button"
                >
                  ➕ Добавить аномалии
                </Button>
                {currentTree.treeItems && currentTree.treeItems.length > 0 && (
                  <>
                    <Button 
                      variant="success" 
                      onClick={() => setShowSubmitModal(true)}
                      className="action-button"
                    >
                      ✅ Подтвердить заявку
                    </Button>
                    <Button 
                      variant="warning" 
                      onClick={() => setShowClearModal(true)}
                      className="action-button"
                    >
                      🗑️ Очистить заявку
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteModal(true)}
                      className="action-button"
                    >
                      ❌ Удалить заявку
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        )}

        {/* Заголовки столбцов */}
        <div className="requests-header">
          <div className="requests-column">АНОМАЛИЯ</div>
          <div className="requests-column">НОМЕРА АНОМАЛЬНЫХ КОЛЕЦ</div>
          <div className="requests-column">РАСЧИТАННЫЙ ГОД</div>
          {isDraft && isOwner && <div className="requests-column">ДЕЙСТВИЯ</div>}
        </div>

        {/* Таблица с заявками */}
        <div className="requests-container">
          {currentTree.treeItems && currentTree.treeItems.length > 0 ? (
            currentTree.treeItems.map((item) => (
              <div key={item.anomaly_id} className="request-item">
                <div className="request-info-section anomaly-section">
                  <div className="request-image">
                    <img 
                      src={item.anomaly_image || defaultImage} 
                      alt={item.anomaly_name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImage;
                      }}
                    />
                  </div>
                  <div className="anomaly-name">
                    {item.anomaly_name}
                  </div>
                </div>
                
                <div className="request-info-section">
                  {editingItem === item.anomaly_id ? (
                    <div className="editing-field-container">
                      <Form.Control
                        type="text"
                        defaultValue={item.anomalous_rings || ''}
                        onChange={(e) => {
                          // Обновляем значение в реальном времени
                          const newValue = e.target.value;
                          if (id) {
                            handleSaveItem(item.anomaly_id!, newValue);
                          }
                        }}
                        placeholder="Например: 1,3,5"
                        className="editable-field"
                        autoFocus
                      />
                      <Form.Text className="text-muted">
                        Введите номера колец через запятую
                      </Form.Text>
                      <div className="editing-controls mt-2">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => setEditingItem(null)}
                        >
                          Закрыть
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`editable-field ${isDraft && isOwner ? 'clickable' : ''}`}
                      onClick={() => isDraft && isOwner && setEditingItem(item.anomaly_id!)}
                    >
                      {item.anomalous_rings || 'Нажмите чтобы указать номера колец'}
                    </div>
                  )}
                </div>
                
                <div className="request-info-section">
                  <div className="calculated-year">
                    {item.calculated_year ? `${item.calculated_year} г.` : 'Не рассчитан'}
                  </div>
                </div>

                {isDraft && isOwner && (
                  <div className="request-info-section actions-section">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleRemoveItem(item.anomaly_id!)}
                      className="action-button-sm"
                    >
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-items">
              <p>Нет аномалий в заявке</p>
              {isDraft && isOwner && (
                <Button onClick={() => navigate('/anomalies')} variant="primary" className="mt-3">
                  ➕ Добавить аномалии из каталога
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Кнопка создания новой заявки */}
        {(!currentTree.treeItems || currentTree.treeItems.length === 0) && (
          <div className="text-center mt-4">
            <Button 
              onClick={handleCreateNewTree}
              variant="outline-primary"
              size="lg"
            >
              🆕 Создать новую заявку
            </Button>
          </div>
        )}
      </Container>

      {/* Модальные окна */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите подтвердить эту заявку?</p>
          <p className="text-muted">
            После подтверждения заявка будет отправлена на рассмотрение модератору 
            и вы не сможете её редактировать.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleSubmitTree}>
            ✅ Подтвердить заявку
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Очистка заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите очистить заявку от всех аномалий?</p>
          <p className="text-muted">
            Все добавленные аномалии будут удалены из заявки.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Отмена
          </Button>
          <Button variant="warning" onClick={handleClearTree}>
            🗑️ Очистить заявку
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удаление заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите удалить эту заявку?</p>
          <p className="text-muted">
            Это действие нельзя будет отменить. Все данные заявки будут удалены.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteTree}>
            ❌ Удалить заявку
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TreeDetailPage;
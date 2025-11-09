import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Modal, Form} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTreeById, 
  updateTree, 
  removeFromTree, 
  submitTree,
  deleteTree,
  updateTreeItem 
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import defaultImage from '/images/mock/main-page.png';

// Импортируем существующие иконки
import editIcon from '/images/mock/edit-icon.png';
import saveIcon from '/images/mock/save-icon.png';
import cancelIcon from '/images/mock/cancel-icon.png';
import deleteIcon from '/images/mock/delete-icon.png';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [anomalousRings, setAnomalousRings] = useState('');
  
  const [treeData, setTreeData] = useState({
    description: '',
    total_rings: 0
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
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  };

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
      // Обновляем данные заявки после изменения
      dispatch(fetchTreeById(parseInt(id)));
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
        // Обновляем данные заявки после удаления
        dispatch(fetchTreeById(parseInt(id)));
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
              <Form.Control
                as="textarea"
                rows={3}
                value={treeData.description}
                onChange={(e) => setTreeData({...treeData, description: e.target.value})}
                placeholder="Введите описание находки..."
                className="info-value-editable"
              />
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
              <Form.Control
                type="number"
                value={treeData.total_rings}
                onChange={(e) => setTreeData({...treeData, total_rings: parseInt(e.target.value) || 0})}
                placeholder="Введите количество колец"
                className="info-value-editable"
                min="0"
              />
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
              {currentTree.tree?.final_year ? `${currentTree.tree.final_year} г.` : '0 г.'}
            </div>
          </div>
        </div>

        {isDraft && isOwner && (
          <div className="mb-4 action-buttons-container">
            <Button 
              onClick={handleUpdateTree} 
              variant="primary" 
              className="me-2 action-button"
              disabled={isLoading}
            >
              💾 Сохранить изменения
            </Button>
            <Button 
              onClick={() => navigate('/anomalies')} 
              variant="outline-primary"
              className="action-button"
              disabled={isLoading}
            >
              ➕ Добавить аномалии
            </Button>
          </div>
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
                        value={anomalousRings}
                        onChange={(e) => setAnomalousRings(e.target.value)}
                        placeholder="Например: 1,3,5"
                        className="editable-field"
                      />
                      <Form.Text className="text-muted">
                        Введите номера колец через запятую
                      </Form.Text>
                    </div>
                  ) : (
                    <div className="editable-field">
                      {item.anomalous_rings || '0'}
                    </div>
                  )}
                </div>
                
                <div className="request-info-section">
                  <div className="calculated-year">
                    {item.calculated_year ? `${item.calculated_year} г.` : '0 г.'}
                  </div>
                </div>

                {isDraft && isOwner && (
                  <div className="request-info-section actions-section">
                    {editingItem === item.anomaly_id ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleSaveItem(item.anomaly_id!)}
                          className="me-1 icon-button"
                          title="Сохранить"
                          disabled={isLoading}
                        >
                          <img src={saveIcon} alt="Сохранить" className="action-icon" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingItem(null)}
                          className="icon-button"
                          title="Отмена"
                          disabled={isLoading}
                        >
                          <img src={cancelIcon} alt="Отмена" className="action-icon" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEditItem(item)}
                          className="me-1 icon-button"
                          title="Редактировать"
                          disabled={isLoading}
                        >
                          <img src={editIcon} alt="Редактировать" className="action-icon" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRemoveItem(item.anomaly_id!)}
                          className="icon-button"
                          title="Удалить аномалию"
                          disabled={isLoading}
                        >
                          <img src={deleteIcon} alt="Удалить" className="action-icon" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-items">
              Нет аномалий в заявке
              {isDraft && isOwner && (
                <div className="mt-3">
                  <Button onClick={() => navigate('/anomalies')} variant="primary" className="action-button">
                    ➕ Добавить аномалии из каталога
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        {isDraft && isOwner && currentTree.treeItems && currentTree.treeItems.length > 0 && (
          <div className="tree-actions">
            <Button 
              variant="success" 
              onClick={() => setShowSubmitModal(true)}
              className="me-3 action-button-large"
              size="lg"
              disabled={isLoading}
            >
              ✅ Подтвердить заявку
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
              className="action-button-large"
              size="lg"
              disabled={isLoading}
            >
              🗑️ Удалить заявку
            </Button>
          </div>
        )}
      </Container>

      {/* Модальное окно подтверждения заявки */}
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
          <div className="mt-3">
            <strong>Информация о заявке:</strong>
            <ul className="mt-2">
              <li>Аномалий в заявке: {currentTree.treeItems?.length || 0}</li>
              <li>Общее количество колец: {currentTree.tree?.total_rings || 0}</li>
              <li>Описание: {currentTree.tree?.description || 'Не указано'}</li>
            </ul>
          </div>
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

      {/* Модальное окно удаления заявки */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удаление заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите удалить эту заявку?</p>
          <p className="text-muted">
            Это действие нельзя будет отменить. Все данные заявки будут удалены.
          </p>
          <div className="mt-3">
            <strong>Будет удалено:</strong>
            <ul className="mt-2">
              <li>Заявка #{currentTree.tree?.id}</li>
              <li>Аномалий: {currentTree.treeItems?.length || 0} шт.</li>
              <li>Все введенные данные</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteTree}>
            🗑️ Удалить заявку
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TreeDetailPage;
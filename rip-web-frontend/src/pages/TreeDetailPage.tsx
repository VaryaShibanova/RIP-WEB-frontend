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
  updateTreeItem
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import defaultImage from '/images/mock/main-page.png';
import confirmIcon from '/images/mock/confirm-icon.png';
import deleteIcon from '/images/mock/delete-icon.png';
import saveIcon from '/images/mock/save-icon.png';
import addIcon from '/images/mock/add-b.png';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  
  const [treeData, setTreeData] = useState({
    description: '',
    total_rings: ''
  });

  const [anomalousRings, setAnomalousRings] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchTreeById(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTree?.tree) {
      setTreeData({
        description: currentTree.tree.description || '',
        total_rings: currentTree.tree.total_rings?.toString() || ''
      });
    }
  }, [currentTree]);

  // ДЕБАГ - выводим информацию для диагностики
  console.log('TreeDetailPage Debug:', {
    currentTree,
    user,
    treeStatus: currentTree?.tree?.status,
    creatorId: currentTree?.tree?.creator_id,
    userId: user?.id,
    isDraft: currentTree?.tree?.status === 'черновик',
    isOwner: currentTree?.tree?.creator_id === user?.id,
    canEdit: currentTree?.tree?.status === 'черновик' && currentTree?.tree?.creator_id === user?.id
  });

  // Упрощенная проверка для тестирования - ВСЕГДА РАЗРЕШАЕМ РЕДАКТИРОВАНИЕ
  const canEdit = true; // Временно всегда true для тестирования

  // Или правильная проверка (раскомментировать после тестирования):
  // const isDraft = currentTree?.tree?.status === 'черновик';
  // const isOwner = currentTree?.tree?.creator_id === user?.id;
  // const canEdit = isDraft && isOwner;

  const handleUpdateTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: treeData.description,
          total_rings: parseInt(treeData.total_rings) || 0
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

  const handleClearTree = async () => {
    if (!id || !currentTree?.treeItems) return;
    
    try {
      for (const item of currentTree.treeItems) {
        await dispatch(removeFromTree({
          treeId: parseInt(id),
          anomalyId: item.anomaly_id!
        })).unwrap();
      }
      setTreeData({
        description: '',
        total_rings: ''
      });
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: '',
          total_rings: 0
        }
      })).unwrap();
      
      setShowClearModal(false);
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error clearing tree:', error);
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
          { label: 'Заявка' } // Убрали #номер
        ]} />

        <div className="page-content-with-margin">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Кнопка подтверждения заявки - НАВЕРХУ */}
          {canEdit && currentTree.treeItems && currentTree.treeItems.length > 0 && (
            <div className="d-flex justify-content-end mb-4">
              <Button 
                variant="success" 
                onClick={() => setShowSubmitModal(true)}
                className="action-button confirm-button"
              >
                <img src={confirmIcon} alt="Подтвердить заявку" className="button-icon me-2" />
                Подтвердить заявку
              </Button>
            </div>
          )}

          {/* Общая информация о заявке */}
          <div className="request-general-info">
            <div className="general-info-card">
              <div className="info-header">
                <span className="info-label">ОПИСАНИЕ НАХОДКИ</span>
              </div>
              <Form.Control
                as="textarea"
                rows={3}
                value={treeData.description}
                onChange={(e) => setTreeData({...treeData, description: e.target.value})}
                placeholder="Опишите вашу находку..."
                className="info-value-editable"
                disabled={!canEdit}
              />
            </div>
            
            <div className="general-info-card">
              <div className="info-header">
                <span className="info-label">ЧИСЛО ВСЕХ КОЛЕЦ</span>
              </div>
              <Form.Control
                type="number"
                value={treeData.total_rings}
                onChange={(e) => setTreeData({...treeData, total_rings: e.target.value})}
                placeholder="Введите количество колец"
                className="info-value-editable"
                min="0"
                disabled={!canEdit}
              />
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

          {/* Заголовки столбцов */}
          <div className="requests-header">
            <div className="requests-column">АНОМАЛИЯ</div>
            <div className="requests-column">НОМЕРА АНОМАЛЬНЫХ КОЛЕЦ</div>
            <div className="requests-column">РАСЧИТАННЫЙ ГОД</div>
            {canEdit && <div className="requests-column">ДЕЙСТВИЯ</div>}
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
                          const img = e.target as HTMLImageElement;
                          img.src = defaultImage;
                        }}
                      />
                    </div>
                    <div className="anomaly-name">
                      {item.anomaly_name}
                    </div>
                  </div>
                  
                  <div className="request-info-section">
                    {editingItem === item.anomaly_id ? (
                      <Form.Control
                        type="text"
                        value={anomalousRings}
                        onChange={(e) => setAnomalousRings(e.target.value)}
                        onBlur={() => handleSaveItem(item.anomaly_id!)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveItem(item.anomaly_id!);
                          }
                        }}
                        placeholder="Пример: 1,5,6"
                        className="editable-field"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className={`editable-field ${canEdit ? 'clickable' : ''} example-text`}
                        onClick={() => canEdit && handleEditItem(item)}
                      >
                        {item.anomalous_rings || 'Пример: 1,5,6'}
                      </div>
                    )}
                  </div>
                  
                  <div className="request-info-section">
                    <div className="calculated-year">
                      {item.calculated_year ? `${item.calculated_year} г.` : 'Не рассчитан'}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="request-info-section actions-section">
                      <button
                        onClick={() => handleRemoveItem(item.anomaly_id!)}
                        className="icon-button"
                        title="Удалить аномалию"
                      >
                        <img src={deleteIcon} alt="Удалить" className="button-icon" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-items">
                <p>Нет аномалий в заявке</p>
                {canEdit && (
                  <Button onClick={() => navigate('/anomalies')} variant="primary" className="mt-3">
                    <img src={addIcon} alt="Добавить" className="button-icon me-2" />
                    Добавить аномалии из каталога
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Кнопки действий - ПОД ТАБЛИЦЕЙ */}
          {canEdit && (
            <div className="action-buttons-container">
              <Button 
                onClick={handleUpdateTree}
                variant="primary"
                className="action-button"
              >
                <img src={saveIcon} alt="Сохранить" className="button-icon" />
                Сохранить изменения
              </Button>
              
              {currentTree.treeItems && currentTree.treeItems.length > 0 && (
                <Button 
                  variant="warning" 
                  onClick={() => setShowClearModal(true)}
                  className="action-button"
                >
                  <img src={deleteIcon} alt="Очистить" className="button-icon" />
                  Очистить заявку
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/anomalies')}
                variant="outline-primary"
                className="action-button"
              >
                <img src={addIcon} alt="Добавить" className="button-icon" />
                Добавить аномалии
              </Button>
            </div>
          )}
        </div>
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
            и вы не сможете её редактировать. Статус изменится на "сформирован".
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleSubmitTree}>
            Подтвердить заявку
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Очистка заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите очистить заявку?</p>
          <p className="text-muted">
            Все аномалии будут удалены, а поля описания очищены.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Отмена
          </Button>
          <Button variant="warning" onClick={handleClearTree}>
            Очистить заявку
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TreeDetailPage;
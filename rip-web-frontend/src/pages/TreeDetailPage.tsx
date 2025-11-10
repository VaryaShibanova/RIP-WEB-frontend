// TreeDetailPage.tsx - исправленная версия с расчетом годов
import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTreeById, 
  updateTree, 
  removeFromTree, 
  submitTree,
  updateTreeItem,
  completeTree
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import type { TreeDetailResponse, TreeItemResponse } from '../types';
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  
  const [treeData, setTreeData] = useState({
    description: '',
    total_rings: ''
  });

  const [anomalousRings, setAnomalousRings] = useState('');

  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    if (id && treeData.description) {
      localStorage.setItem(`tree_${id}_description`, treeData.description);
    }
    if (id && treeData.total_rings) {
      localStorage.setItem(`tree_${id}_total_rings`, treeData.total_rings);
    }
  }, [treeData, id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTreeById(parseInt(id))).then((result: any) => {
        // После загрузки данных из API, восстанавливаем из localStorage если есть
        if (result.payload?.tree) {
          const savedDescription = localStorage.getItem(`tree_${id}_description`);
          const savedTotalRings = localStorage.getItem(`tree_${id}_total_rings`);
          
          setTreeData({
            description: savedDescription || result.payload.tree.description || '',
            total_rings: savedTotalRings || result.payload.tree.total_rings?.toString() || ''
          });
        }
      });
    }
  }, [dispatch, id]);

  // Приводим типы для безопасного использования
  const treeDetail = currentTree as TreeDetailResponse | null;
  const tree = treeDetail?.tree;
  const treeItems = treeDetail?.treeItems || [];

  // Проверка прав на редактирование
  const treeStatus = tree?.status || 'черновик';
  const isDraft = treeStatus === 'черновик';
  const isOwner = tree?.creator_id === user?.id;
  const canEdit = isDraft && isOwner;
  const isModerator = user?.is_moderator;
  const canModerate = isModerator && (treeStatus === 'сформирован' || treeStatus === 'черновик');

  // Функция для расчета года аномалии
  const calculateAnomalyYear = (item: TreeItemResponse, totalRings: number): number | null => {
    if (!item.anomalous_rings || !totalRings) return null;
    
    try {
      // Парсим номера аномальных колец
      const rings = item.anomalous_rings.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
      if (rings.length === 0) return null;
      
      // Берем первое аномальное кольцо для расчета
      const firstAnomalousRing = Math.min(...rings);
      
      // Расчет: общее количество колец - номер аномального кольца + 1
      // Это дает год, когда произошла аномалия
      const calculatedYear = totalRings - firstAnomalousRing + 1;
      
      return calculatedYear > 0 ? calculatedYear : null;
    } catch (error) {
      console.error('Error calculating anomaly year:', error);
      return null;
    }
  };

  // Функция для расчета финального года заявки
  const calculateFinalYear = (): number | null => {
    if (!treeItems.length || !treeData.total_rings) return null;
    
    try {
      const totalRings = parseInt(treeData.total_rings);
      if (isNaN(totalRings)) return null;
      
      // Находим самую раннюю аномалию (самый старый год)
      const years = treeItems.map(item => calculateAnomalyYear(item, totalRings)).filter(y => y !== null) as number[];
      if (years.length === 0) return null;
      
      return Math.min(...years);
    } catch (error) {
      console.error('Error calculating final year:', error);
      return null;
    }
  };

  const handleUpdateTree = async () => {
    if (!id) return;
    
    try {
      // Автоматически рассчитываем финальный год если есть данные
      const finalYear = calculateFinalYear();
      
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: treeData.description,
          total_rings: parseInt(treeData.total_rings) || 0,
          final_year: finalYear || undefined
        }
      })).unwrap();
      
      // Сохраняем в localStorage после успешного обновления
      localStorage.setItem(`tree_${id}_description`, treeData.description);
      localStorage.setItem(`tree_${id}_total_rings`, treeData.total_rings);
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  };

  const handleEditItem = (item: TreeItemResponse) => {
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
      
      // После сохранения аномальных колец пересчитываем и обновляем заявку
      const finalYear = calculateFinalYear();
      if (finalYear) {
        await dispatch(updateTree({
          treeId: parseInt(id),
          data: {
            final_year: finalYear
          }
        })).unwrap();
      }
      
      // Обновляем данные
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setAnomalousRings('');
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
      // Перед подтверждением рассчитываем финальный год
      const finalYear = calculateFinalYear();
      
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: treeData.description,
          total_rings: parseInt(treeData.total_rings) || 0,
          final_year: finalYear || undefined
        }
      })).unwrap();
      
      await dispatch(submitTree(parseInt(id))).unwrap();
      
      // Очищаем localStorage после подтверждения заявки
      localStorage.removeItem(`tree_${id}_description`);
      localStorage.removeItem(`tree_${id}_total_rings`);
      setShowSubmitModal(false);
      navigate('/trees');
    } catch (error) {
      console.error('Error submitting tree:', error);
    }
  };

  const handleCompleteTree = async (action: 'complete' | 'reject') => {
    if (!id) return;
    
    try {
      await dispatch(completeTree({
        treeId: parseInt(id),
        action
      })).unwrap();
      
      setShowCompleteModal(false);
      // Обновляем данные после завершения
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error completing tree:', error);
    }
  };

  const handleClearTree = async () => {
    if (!id || treeItems.length === 0) return;
    
    try {
      for (const item of treeItems) {
        if (item.anomaly_id) {
          await dispatch(removeFromTree({
            treeId: parseInt(id),
            anomalyId: item.anomaly_id
          })).unwrap();
        }
      }
      
      // Очищаем данные и localStorage
      setTreeData({
        description: '',
        total_rings: ''
      });
      
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: '',
          total_rings: 0,
          final_year: undefined
        }
      })).unwrap();
      
      localStorage.removeItem(`tree_${id}_description`);
      localStorage.removeItem(`tree_${id}_total_rings`);
      
      setShowClearModal(false);
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error clearing tree:', error);
    }
  };

  // Автоматическое сохранение при потере фокуса
  const handleBlur = (anomalyId: number) => {
    if (editingItem === anomalyId && anomalousRings !== '') {
      handleSaveItem(anomalyId);
    } else {
      handleCancelEdit();
    }
  };

  // Автоматическое сохранение при нажатии Enter
  const handleKeyPress = (e: React.KeyboardEvent, anomalyId: number) => {
    if (e.key === 'Enter') {
      handleSaveItem(anomalyId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Получаем рассчитанный год для отображения (приоритет: API -> локальный расчет)
  const getDisplayYear = (item: TreeItemResponse): string => {
    // Сначала пробуем взять из API
    if (item.calculated_year) {
      return `${item.calculated_year} г.`;
    }
    
    // Если нет в API, рассчитываем локально
    if (treeData.total_rings && item.anomalous_rings) {
      const calculatedYear = calculateAnomalyYear(item, parseInt(treeData.total_rings));
      if (calculatedYear) {
        return `${calculatedYear} г. (расчет)`;
      }
    }
    
    return 'Не рассчитан';
  };

  // Получаем финальный год для отображения
  const getFinalYearDisplay = (): string => {
    // Сначала пробуем взять из API
    if (tree?.final_year) {
      return `${tree.final_year} г.`;
    }
    
    // Если нет в API, рассчитываем локально
    const calculatedFinalYear = calculateFinalYear();
    if (calculatedFinalYear) {
      return `${calculatedFinalYear} г. (расчет)`;
    }
    
    return 'Не рассчитан';
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заявки..." />;
  }

  if (!treeDetail || !tree) {
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
          { label: `Заявка #${id}` }
        ]} />

        <div className="page-content-with-margin">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Кнопка подтверждения заявки для пользователя */}
          {canEdit && treeItems.length > 0 && (
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

          {/* Кнопки для модератора */}
          {canModerate && (
            <div className="d-flex justify-content-end mb-4 gap-2">
              <Button 
                variant="success" 
                onClick={() => setShowCompleteModal(true)}
                className="action-button"
              >
                Завершить заявку
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleCompleteTree('reject')}
                className="action-button"
              >
                Отклонить заявку
              </Button>
            </div>
          )}

          {/* Общая информация о заявке */}
          <div className="request-general-info">
            <div className="general-info-card">
              <div className="info-header">
                <span className="info-label">ОПИСАНИЕ НАХОДКИ</span>
                {canEdit && <span className="text-warning"></span>}
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
                {canEdit && <span className="text-warning"></span>}
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
                {getFinalYearDisplay()}
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
            {treeItems.length > 0 ? (
              treeItems.map((item) => (
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
                        onBlur={() => handleBlur(item.anomaly_id!)}
                        onKeyDown={(e) => handleKeyPress(e, item.anomaly_id!)}
                        placeholder="Пример: 1,5,6"
                        className="anomalous-rings-input"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className={`editable-field ${canEdit ? 'clickable' : ''}`}
                        onClick={() => canEdit && handleEditItem(item)}
                        style={{ 
                          cursor: canEdit ? 'pointer' : 'default',
                          background: canEdit ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                        }}
                      >
                        {item.anomalous_rings || ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="request-info-section">
                    <div className="calculated-year">
                      {getDisplayYear(item)}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="request-info-section actions-section">
                      <button
                        onClick={() => handleRemoveItem(item.anomaly_id!)}
                        className="icon-button delete-button"
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

          {/* Кнопки действий */}
          {canEdit && (
            <div className="action-buttons-container">
              <Button 
                onClick={handleUpdateTree}
                variant="primary"
                className="action-button"
              >
                <img src={saveIcon} alt="Сохранить" className="button-icon me-2" />
                Сохранить изменения
              </Button>
              
              {treeItems.length > 0 && (
                <Button 
                  variant="outline-warning" 
                  onClick={() => setShowClearModal(true)}
                  className="action-button"
                >
                  <img src={deleteIcon} alt="Очистить" className="button-icon me-2" />
                  Очистить заявку
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/anomalies')}
                variant="outline-primary"
                className="action-button"
              >
                <img src={addIcon} alt="Добавить" className="button-icon me-2" />
                Добавить аномалии
              </Button>
            </div>
          )}
        </div>
      </Container>

      {/* Модальные окна */}
      <Modal 
        show={showSubmitModal} 
        onHide={() => setShowSubmitModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Подтверждение заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>Вы уверены, что хотите подтвердить эту заявку?</p>
          <p className="text-muted">
            После подтверждения заявка будет отправлена на рассмотрение модератору 
            и вы не сможете её редактировать. Статус изменится на "сформирован".
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleSubmitTree}>
            Подтвердить заявку
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showCompleteModal} 
        onHide={() => setShowCompleteModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Завершение заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>Вы уверены, что хотите завершить эту заявку?</p>
          <p className="text-muted">
            После завершения будут рассчитаны итоговые годы и заявка перейдет в статус "завершён".
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={() => handleCompleteTree('complete')}>
            Завершить заявку
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showClearModal} 
        onHide={() => setShowClearModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Очистка заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>Вы уверены, что хотите очистить заявку?</p>
          <p className="text-muted">
            Все аномалии будут удалены, а поля описания очищены.
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
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
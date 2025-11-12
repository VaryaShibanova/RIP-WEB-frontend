// TreeDetailPage.tsx - исправленная версия
import React, { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTreeById, 
  updateTree, 
  removeFromTree, 
  submitTree,
  updateTreeItem,
  completeTree,
  setTreeLocalData,
  clearTreeLocalData
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import type { TreeDetailResponse, TreeItemResponse } from '../types';
import defaultImage from '/images/mock/main-page.png';
import confirmIcon from '/images/mock/confirm-icon.png';
import deleteIcon from '/images/mock/delete-icon.png';
import addIcon from '/images/mock/add-b.png';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error, localTreeData } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [anomalousRings, setAnomalousRings] = useState('');

  // Получаем локальные данные из Redux store
  const treeId = id ? parseInt(id) : 0;
  const localData = localTreeData?.[treeId] || {
    description: '',
    totalRings: '',
    anomalousRings: {}
  };

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
  const canModerate = isModerator && treeStatus === 'сформирован';

  // Загружаем данные заявки при монтировании
  useEffect(() => {
    if (id) {
      dispatch(fetchTreeById(parseInt(id)));
    }
  }, [dispatch, id]);

  // ОТЛАДКА: проверяем что происходит с данными
  useEffect(() => {
    console.log('🔍 TreeDetailPage ОТЛАДКА:', {
      treeId,
      localTreeData,
      localData,
      currentTree: currentTree?.tree,
      hasLocalData: !!localTreeData?.[treeId]
    });
  }, [treeId, localTreeData, localData, currentTree]);

  // Обработчики изменений (сохраняем в Redux сразу)
  const handleDescriptionChange = (value: string) => {
    if (!id) return;
    console.log('📝 Изменение описания:', value);
    dispatch(setTreeLocalData({
      treeId: parseInt(id),
      description: value
    }));
  };

  const handleTotalRingsChange = (value: string) => {
    if (!id) return;
    const numericValue = value.replace(/[^0-9]/g, '');
    console.log('🔢 Изменение количества колец:', numericValue);
    dispatch(setTreeLocalData({
      treeId: parseInt(id),
      totalRings: numericValue
    }));
  };

  // Для аномальных колец
  const handleEditItem = (item: TreeItemResponse) => {
    setEditingItem(item.anomaly_id!);
    const ringsToEdit = localData.anomalousRings[item.anomaly_id!] || item.anomalous_rings || '';
    setAnomalousRings(ringsToEdit);
  };

  const handleSaveItem = async (anomalyId: number) => {
    if (!id) return;
    
    try {
      // Сохраняем в БД
      await dispatch(updateTreeItem({
        treeId: parseInt(id),
        anomalyId,
        anomalousRings
      })).unwrap();
      
      // Сохраняем в Redux
      dispatch(setTreeLocalData({
        treeId: parseInt(id),
        anomalousRings: {
          ...localData.anomalousRings,
          [anomalyId]: anomalousRings
        }
      }));
      
      setEditingItem(null);
    } catch (error) {
      console.error('❌ Error updating item:', error);
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
      
      // Удаляем из Redux
      const updatedRings = { ...localData.anomalousRings };
      delete updatedRings[anomalyId];
      dispatch(setTreeLocalData({
        treeId: parseInt(id),
        anomalousRings: updatedRings
      }));
      
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Действия без модальных окон
  const handleSubmitTree = async () => {
    if (!id) return;
    
    try {
      // Сохраняем поля в БД перед подтверждением
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: localData.description,
          total_rings: parseInt(localData.totalRings) || 0
        }
      })).unwrap();
      
      await dispatch(submitTree(parseInt(id))).unwrap();
      
      // Очищаем локальные данные после подтверждения
      dispatch(clearTreeLocalData(parseInt(id)));
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
      
      // Обновляем данные после завершения
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error completing tree:', error);
    }
  };

  const handleClearTree = async () => {
    if (!id) return;
    
    try {
      // Удаляем все аномалии если они есть
      if (treeItems.length > 0) {
        for (const item of treeItems) {
          if (item.anomaly_id) {
            await dispatch(removeFromTree({
              treeId: parseInt(id),
              anomalyId: item.anomaly_id
            })).unwrap();
          }
        }
      }
      
      // Очищаем локальные данные
      dispatch(setTreeLocalData({
        treeId: parseInt(id),
        description: '',
        totalRings: '',
        anomalousRings: {}
      }));
      
      // Очищаем в БД
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: '',
          total_rings: 0
        }
      })).unwrap();
      
      dispatch(fetchTreeById(parseInt(id)));
    } catch (error) {
      console.error('Error clearing tree:', error);
    }
  };

  // Получаем отображаемые значения
  const getDisplayRings = (item: TreeItemResponse): string => {
    return localData.anomalousRings[item.anomaly_id!] || item.anomalous_rings || '';
  };

  const getDisplayYear = (item: TreeItemResponse): string => {
    if (item.calculated_year) {
      return `${item.calculated_year} г.`;
    }
    return 'Не рассчитан';
  };

  const getFinalYearDisplay = (): string => {
    if (tree?.final_year) {
      return `${tree.final_year} г.`;
    }
    return 'Не рассчитан';
  };

  // Автоматическое сохранение при потере фокуса для аномальных колец
  const handleBlur = (anomalyId: number) => {
    if (editingItem === anomalyId && anomalousRings !== '') {
      handleSaveItem(anomalyId);
    } else {
      handleCancelEdit();
    }
  };

  // Автоматическое сохранение при нажатии Enter для аномальных колец
  const handleKeyPress = (e: React.KeyboardEvent, anomalyId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSaveItem(anomalyId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Загрузка заявки..." />;
  }

  if (!treeDetail || !tree) {
    return (
      <Container className="page-container">
        <div className="text-center">
          <h3>Заявка не найдена</h3>
          <button onClick={() => navigate('/trees')} className="btn-action-primary">
            Вернуться к списку заявок
          </button>
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
          { label: `Заявка` }
        ]} />

        <div className="page-content-with-margin">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Кнопка подтверждения заявки для пользователя - справа */}
          <div className="d-flex justify-content-end mb-4">
            {canEdit && treeItems.length > 0 && (
              <button 
                onClick={handleSubmitTree}
                className="btn-action-primary"
              >
                <img src={confirmIcon} alt="Подтвердить заявку" className="button-icon" />
                Подтвердить заявку
              </button>
            )}

            {/* Кнопки для модератора - справа */}
            {canModerate && (
              <div className="d-flex gap-2">
                <button 
                  onClick={() => handleCompleteTree('complete')}
                  className="btn-action-primary"
                >
                  Завершить заявку
                </button>
                <button 
                  onClick={() => handleCompleteTree('reject')}
                  className="btn-action-danger"
                >
                  Отклонить заявку
                </button>
              </div>
            )}
          </div>

          {/* Общая информация о заявке */}
          <div className="request-general-info">
            <div className="general-info-card">
              <div className="info-header">
                <span className="info-label">ОПИСАНИЕ НАХОДКИ</span>
                {canEdit && <span className="text-warning"></span>}
              </div>
              <textarea
                rows={3}
                value={localData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
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
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localData.totalRings}
                onChange={(e) => handleTotalRingsChange(e.target.value)}
                placeholder="Введите количество колец"
                className="info-value-editable"
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
                      <input
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
                      >
                        {getDisplayRings(item)}
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
                {/*{canEdit && (
                  <button onClick={() => navigate('/anomalies')} className="btn-action-outline mt-3">
                    <img src={addIcon} alt="Добавить" className="button-icon" />
                    Добавить аномалии из каталога
                  </button>
                )}*/}
              </div>
            )}
          </div>

          {/* Кнопки действий внизу */}
          {canEdit && (
            <div className="action-buttons-container">
              {treeItems.length > 0 && (
                <button 
                  onClick={handleClearTree}
                  className="btn-action-outline"
                >
                  <img src={deleteIcon} alt="Очистить" className="button-icon" />
                  Очистить заявку
                </button>
              )}
              
              <button 
                onClick={() => navigate('/anomalies')}
                className="btn-action-outline"
              >
                <img src={addIcon} alt="Добавить" className="button-icon" />
                Добавить аномалии
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default TreeDetailPage;
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
  setTreeLocalData,
  clearTreeLocalData
} from '../slices/treeSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import type { TreeDetailResponse, TreeItemResponse } from '../types';
import defaultImage from '/images/mock/main-page.png';
import confirmIcon from '/images/mock/confirm-icon.png';
import deleteIcon from '/images/mock/delete-icon.png';

const TreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTree, isLoading, error, localTreeData } = useAppSelector((state) => state.trees);
  const { user } = useAppSelector((state) => state.auth);
  
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [anomalousRings, setAnomalousRings] = useState('');

  const treeId = id ? parseInt(id) : 0;
  const localData = localTreeData?.[treeId] || {
    description: '',
    totalRings: '',
    anomalousRings: {}
  };

  const treeDetail = currentTree as TreeDetailResponse | null;
  const tree = treeDetail?.tree;
  const treeItems = treeDetail?.treeItems || [];

  const treeStatus = tree?.status || 'черновик';
  const isDraft = treeStatus === 'черновик';
  const isOwner = tree?.creator_id === user?.id;
  const canEdit = isDraft && isOwner;

  useEffect(() => {
    if (id) {
      dispatch(fetchTreeById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleDescriptionChange = (value: string) => {
    if (!id) return;
    dispatch(setTreeLocalData({
      treeId: parseInt(id),
      description: value
    }));
  };

  const handleTotalRingsChange = (value: string) => {
    if (!id) return;
    const numericValue = value.replace(/[^0-9]/g, '');
    dispatch(setTreeLocalData({
      treeId: parseInt(id),
      totalRings: numericValue
    }));
  };

  const handleSaveTreeData = async () => {
    if (!id) return;
    
    try {
      await dispatch(updateTree({
        treeId: parseInt(id),
        data: {
          description: localData.description,
          total_rings: parseInt(localData.totalRings) || 0
        }
      })).unwrap();
      console.log('✅ Данные заявки сохранены');
    } catch (error) {
      console.error('❌ Ошибка сохранения данных заявки:', error);
    }
  };

  const handleEditItem = (item: TreeItemResponse) => {
    setEditingItem(item.anomaly_id!);
    const ringsToEdit = localData.anomalousRings[item.anomaly_id!] || item.anomalous_rings || '';
    setAnomalousRings(ringsToEdit);
  };

  const handleSaveItem = async (anomalyId: number) => {
    if (!id) return;
    
    try {
      await dispatch(updateTreeItem({
        treeId: parseInt(id),
        anomalyId,
        anomalousRings
      })).unwrap();
      
      dispatch(setTreeLocalData({
        treeId: parseInt(id),
        anomalousRings: {
          ...localData.anomalousRings,
          [anomalyId]: anomalousRings
        }
      }));
      
      setEditingItem(null);
      console.log('✅ Аномальные кольца сохранены');
    } catch (error) {
      console.error('❌ Error updating item:', error);
    }
  };

  const handleRemoveItem = async (anomalyId: number) => {
    if (!id) return;
    
    try {
      await dispatch(removeFromTree({
        treeId: parseInt(id),
        anomalyId
      })).unwrap();
      
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

  const handleSubmitTree = async () => {
    if (!id) return;
    
    try {
      await dispatch(submitTree(parseInt(id))).unwrap();
      dispatch(clearTreeLocalData(parseInt(id)));
      navigate('/trees');
    } catch (error) {
      console.error('Error submitting tree:', error);
    }
  };

  // ФУНКЦИЯ ОЧИСТКИ ЗАЯВКИ - ПРОСТАЯ КНОПКА БЕЗ ПОДТВЕРЖДЕНИЙ
  const handleClearTree = async () => {
    if (!id || !tree) return;
    
    try {
      // Удаляем все аномалии из заявки
      for (const item of treeItems) {
        await dispatch(removeFromTree({
          treeId: parseInt(id),
          anomalyId: item.anomaly_id!
        })).unwrap();
      }
      
      // Очищаем локальные данные
      dispatch(setTreeLocalData({
        treeId: parseInt(id),
        description: '',
        totalRings: '',
        anomalousRings: {}
      }));
      
      // Обновляем заявку
      dispatch(fetchTreeById(parseInt(id)));
      
      console.log('✅ Заявка очищена');
    } catch (error) {
      console.error('❌ Ошибка очистки заявки:', error);
    }
  };

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
        {/* ХЛЕБНЫЕ КРОШКИ: Главная / Каталог аномалий / Моя заявка */}
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Каталог аномалий', path: '/anomalies' },
          { label: 'Моя заявка' }
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
              <button 
                onClick={handleSubmitTree}
                className="btn-action-primary"
              >
                <img src={confirmIcon} alt="Подтвердить заявку" className="button-icon" />
                Подтвердить заявку
              </button>
            </div>
          )}

          {/* Общая информация о заявке */}
          <div className="request-general-info">
            <div className="general-info-card">
              <div className="info-header">
                <span className="info-label">ОПИСАНИЕ НАХОДКИ</span>
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

            {/* ОБЩАЯ КНОПКА СОХРАНЕНИЯ */}
            {canEdit && (
              <div className="general-info-card">
                <div className="info-header">
                  <span className="info-label">СОХРАНЕНИЕ ДАННЫХ</span>
                </div>
                <button 
                  onClick={handleSaveTreeData}
                  className="btn-save-large"
                >
                  💾 Сохранить описание и число колец
                </button>
              </div>
            )}
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
                      <div className="editing-container">
                        <input
                          type="text"
                          value={anomalousRings}
                          onChange={(e) => setAnomalousRings(e.target.value)}
                          placeholder="Пример: 1,5,6"
                          className="anomalous-rings-input"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleSaveItem(item.anomaly_id!)}
                          className="btn-save-inline"
                        >
                          Сохранить
                        </button>
                      </div>
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
              </div>
            )}
          </div>

          {/* Кнопки действий внизу - ОЧИСТКА ЗАЯВКИ */}
          {canEdit && (
            <div className="action-buttons-container">
              {treeItems.length > 0 && (
                <button 
                  onClick={handleClearTree}
                  className="btn-action-outline"
                >
                  <img src={deleteIcon} alt="Очистить заявку" className="button-icon" />
                  Очистить заявку
                </button>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default TreeDetailPage;
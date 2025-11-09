import React from 'react';
import type { AnomalyShortResponse } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addToTree } from '../slices/treeSlice';
import { useCart } from '../hooks/useCart';
import defaultImage from '/images/mock/main-page.png';
import addIcon from '/images/mock/add-b.png';

interface AnomalyCardProps {
  anomaly: AnomalyShortResponse;
  onViewDetails: (id: number) => void;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, onViewDetails }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { syncCartWithApi } = useCart();

  const handleAddToTree = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Для добавления в заявку необходимо войти в систему');
      return;
    }

    try {
      await dispatch(addToTree(anomaly.id!)).unwrap();
      await syncCartWithApi();
      console.log('Добавлено в заявку:', anomaly.id);
    } catch (error) {
      console.error('Ошибка при добавлении в заявку:', error);
    }
  };

  return (
    <div className="anomaly-card">
      <div 
        className="anomaly-link"
        onClick={() => onViewDetails(anomaly.id!)}
      >
        <img 
          src={anomaly.image_url || defaultImage}
          alt={anomaly.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="anomaly-header">
          <h3>{anomaly.name}</h3>
          <button 
            className="add-to-tree-btn"
            title={isAuthenticated ? "Добавить в исследование" : "Войдите для добавления"}
            onClick={handleAddToTree}
            disabled={!isAuthenticated}
          >
            <img src={addIcon} alt="Добавить" />
          </button>
        </div>
        <div className="year">Год начала: {anomaly.year} г.</div>
      </div>
    </div>
  );
};

export default AnomalyCard;
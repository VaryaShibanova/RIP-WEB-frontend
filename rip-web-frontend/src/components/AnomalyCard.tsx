import React from 'react';
import type { AnomalyShortResponse } from '../types';
import { useCart } from '../hooks/useCart';
import defaultImage from '/images/mock/main-page.png';
import addIcon from '/images/mock/add-b.png';

interface AnomalyCardProps {
  anomaly: AnomalyShortResponse;
  onViewDetails: (id: number) => void;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, onViewDetails }) => {
  const { addItemToCart } = useCart();

  const handleAddToTree = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart(anomaly);
    console.log('Добавлено в корзину:', anomaly.id);
  };

  return (
    <div className="anomaly-card">
      <div 
        className="anomaly-link"
        onClick={() => onViewDetails(anomaly.id)}
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
            title="Добавить в исследование"
            onClick={handleAddToTree}
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
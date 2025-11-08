import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import type { AnomalyDetailResponse } from '../types';
import { apiService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import defaultImage from '/images/mock/main-page.png';
import closeIcon from '/images/mock/close-b.jpg';

const AnomalyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anomaly, setAnomaly] = useState<AnomalyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadAnomaly(parseInt(id));
    }
  }, [id]);

  const loadAnomaly = async (anomalyId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAnomaly(anomalyId);
      setAnomaly(data);
    } catch (error) {
      console.error('Error loading anomaly details:', error);
      setError('Не удалось загрузить данные аномалии');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/anomalies');
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Container className="page-container">
          <LoadingSpinner size="lg" text="Загрузка деталей аномалии..." />
        </Container>
      </div>
    );
  }

  if (error || !anomaly) {
    return (
      <div className="detail-page">
        <Container className="page-container">
          <div className="text-center" style={{ color: '#060F1E', padding: '50px' }}>
            <p>{error || 'Аномалия не найдена'}</p>
            <Button variant="primary" onClick={handleBack}>
              Вернуться к каталогу
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Container className="page-container">
        <div className="breadcrumbs-container">
          <Breadcrumbs items={[
            { label: 'Главная', path: '/' },
            { label: 'Аномальные паттерны', path: '/anomalies' },
            { label: anomaly.name }
          ]} />
        </div>

        <div className="detail-header">
          <div className="detail-year">ГОД НАЧАЛА: {anomaly.year}г.</div>
          <Button 
            variant="link" 
            className="close-button"
            onClick={handleBack}
          >
            <img src={closeIcon} alt="Закрыть" />
          </Button>
        </div>
        
        <h1 className="detail-title">{anomaly.name}</h1>
        
        <img 
          src={anomaly.image_url || defaultImage} 
          alt={anomaly.name} 
          className="detail-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        <div className="detail-info-block">
          {anomaly.description}
        </div>
      </Container>
    </div>
  );
};

export default AnomalyDetailPage;
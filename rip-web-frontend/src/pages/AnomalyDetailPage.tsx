import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import type { AnomalyDetailResponse } from '../types';
import { apiService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';

const AnomalyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anomaly, setAnomaly] = useState<AnomalyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnomaly(parseInt(id));
    }
  }, [id]);

  const loadAnomaly = async (anomalyId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getAnomaly(anomalyId);
      setAnomaly(data);
    } catch (error) {
      console.error('Error loading anomaly details:', error);
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
          <div className="text-center" style={{ color: 'white', padding: '50px' }}>
            Загрузка деталей аномалии...
          </div>
        </Container>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="detail-page">
        <Container className="page-container">
          <div className="text-center" style={{ color: 'white', padding: '50px' }}>
            Аномалия не найдена
          </div>
        </Container>
      </div>
    );
  }

  const defaultImage = "/images/mock/main-page.png";

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
            <img src="/images/mock/close-b.jpg" alt="Закрыть" />
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
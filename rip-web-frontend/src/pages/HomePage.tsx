import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Декоративные элементы */}
      <div className="decoration decoration-large"></div>
      <div className="decoration decoration-medium"></div>
      <div className="decoration decoration-small"></div>
      
      <Container className="page-container"> {/* ДОБАВЬТЕ ЭТОТ КОНТЕЙНЕР */}
        <div className="home-page-content">
          <div className="hero-section">
            <h1 className="hero-title">
              ДЕНДРОХРОНОЛОГИЧЕСКИЕ ИССЛЕДОВАНИЯ
            </h1>
            <p className="hero-subtitle">
              Изучение климатических изменений через анализ годичных колец деревьев. 
              Откройте для себя уникальные аномалии в дендрошкале и создайте собственную 
              исследовательскую заявку.
            </p>
            <div className="hero-buttons">
              <Button
                className="hero-button"
                onClick={() => navigate('/anomalies')}
              >
                Каталог аномалий
              </Button>
              <Button
                className="hero-button secondary"
                onClick={() => navigate('/my-request')}
              >
                Моя заявка
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
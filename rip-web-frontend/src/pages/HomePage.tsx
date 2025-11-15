import React from 'react';
import { Container } from 'react-bootstrap';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* Декоративные элементы */}
      <div className="decoration decoration-large"></div>
      <div className="decoration decoration-medium"></div>
      <div className="decoration decoration-small"></div>
      
      <Container className="page-container">
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
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
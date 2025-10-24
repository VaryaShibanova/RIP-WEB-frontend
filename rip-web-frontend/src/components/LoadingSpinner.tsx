import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: string; // Изменяем тип
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'lg', 
  text = 'Загрузка...' 
}) => {
  // Кастомные стили для разных размеров
  const getSpinnerStyle = () => {
    switch (size) {
      case 'sm': return { width: '1.5rem', height: '1.5rem' };
      case 'lg': return { width: '3rem', height: '3rem' };
      case 'xl': return { width: '4rem', height: '4rem' };
      default: return { width: '3rem', height: '3rem' };
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <Spinner 
        animation="border" 
        role="status" 
        variant="light"
        style={getSpinnerStyle()}
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <div className="mt-2 text-light">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
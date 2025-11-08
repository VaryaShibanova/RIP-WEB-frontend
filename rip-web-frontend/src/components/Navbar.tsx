import React, { useState } from 'react';
import { Navbar, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/images/mock/logo.png';

const CustomNavbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleCatalogClick = () => {
    navigate('/anomalies');
    setShowDropdown(false);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
      <div className="navbar-container">
        <Navbar.Brand as={Link} to="/" className="navbar-brand-with-logo">
          <img 
            src={logo} 
            alt="Дендроанализ" 
            className="navbar-logo"
          />
          <span className="navbar-brand-text">ДЕНДРОАНАЛИЗ</span>
        </Navbar.Brand>
        
        {/* Навигационное меню с гамбургер-иконкой */}
        <div className="navbar-nav-container">
          <Dropdown 
            show={showDropdown} 
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            className="navbar-dropdown"
          >
            <Dropdown.Toggle as={CustomToggle} id="navbar-dropdown">
              {/* Гамбургер иконка */}
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="navbar-dropdown-menu">
              <Dropdown.Item 
                onClick={handleCatalogClick}
                className="navbar-dropdown-item"
              >
                Каталог аномалий
              </Dropdown.Item>
              {/* Можно добавить другие пункты меню позже */}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

// Кастомный компонент для кнопки Dropdown.Toggle
const CustomToggle = React.forwardRef<HTMLDivElement, any>(
  ({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="navbar-dropdown-toggle"
    >
      {children}
    </div>
  )
);

export default CustomNavbar;
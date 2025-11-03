import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '/images/mock/logo.png';

const CustomNavbar: React.FC = () => {
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
        {/*
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/anomalies" 
              className={location.pathname === '/anomalies' ? 'nav-link active' : 'nav-link'}
            >
              Каталог аномалий
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/my-request" 
              className={location.pathname === '/my-request' ? 'nav-link active' : 'nav-link'}
            >
              Моя заявка
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        */}
      </div>
    </Navbar>
  );
};

export default CustomNavbar;
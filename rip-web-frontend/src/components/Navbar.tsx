import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutUser } from '../slices/authSlice';
import { useCart } from '../hooks/useCart';
import { useTrees } from '../hooks/useTree';
import logo from '/images/mock/logo.png';

const CustomNavbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { itemCount } = useAppSelector((state) => state.cart);
  const { trees, loadUserTrees } = useTrees();
  const { syncCartWithApi } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      syncCartWithApi();
      loadUserTrees();
    }
  }, [isAuthenticated, syncCartWithApi, loadUserTrees]);

  const draftTree = trees.find(tree => tree.status === 'черновик');

  const handleLogoutClick = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      if (draftTree) {
        navigate(`/trees/${draftTree.id}`);
      } else {
        navigate('/trees');
      }
    } else {
      navigate('/login');
    }
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
        
        {/* Desktop Navigation */}
        <Nav className="d-none d-lg-flex me-auto">
          <Nav.Link as={Link} to="/anomalies" className="nav-link-custom">
            Каталог аномалий
          </Nav.Link>
          {isAuthenticated && (
            <Nav.Link as={Link} to="/trees" className="nav-link-custom">
              Мои заявки
            </Nav.Link>
          )}
        </Nav>

        <div className="navbar-nav-container">
          {/* Desktop User Menu */}
          <div className="d-none d-lg-flex align-items-center">
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="user-dropdown" className="user-dropdown-toggle">
                  {user?.login || 'Профиль'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="navbar-dropdown-menu">
                  <Dropdown.Item as={Link} to="/profile" className="navbar-dropdown-item">
                    Профиль
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogoutClick} className="navbar-dropdown-item">
                    Выйти
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Nav.Link as={Link} to="/login" className="nav-link-custom">
                  Войти
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-custom">
                  Регистрация
                </Nav.Link>
              </div>
            )}
          </div>

          {/* Mobile Burger Menu */}
          <Dropdown 
            show={showDropdown} 
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            className="d-lg-none navbar-dropdown"
          >
            <Dropdown.Toggle as={CustomToggle} id="navbar-dropdown">
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="navbar-dropdown-menu">
              <Dropdown.Item 
                as={Link}
                to="/anomalies"
                className="navbar-dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Каталог аномалий
              </Dropdown.Item>

              {isAuthenticated ? (
                <>
                  <Dropdown.Item 
                    as={Link}
                    to="/trees"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Мои заявки
                  </Dropdown.Item>
                  <Dropdown.Item 
                    as={Link}
                    to="/profile"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    {user?.login || 'Профиль'}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    onClick={handleLogoutClick}
                    className="navbar-dropdown-item"
                  >
                    Выйти
                  </Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item 
                    as={Link}
                    to="/login"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Войти
                  </Dropdown.Item>
                  <Dropdown.Item 
                    as={Link}
                    to="/register"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Регистрация
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

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
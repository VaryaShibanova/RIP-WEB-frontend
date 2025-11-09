import React, { useState, useEffect } from 'react';
import { Navbar, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutUser } from '../slices/authSlice';
import { useCart } from '../hooks/useCart';
import { useTrees } from '../hooks/useTrees';
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

  const handleCatalogClick = () => {
    navigate('/anomalies');
    setShowDropdown(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setShowDropdown(false);
  };

  const handleLogoutClick = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleTreesClick = () => {
    navigate('/trees');
    setShowDropdown(false);
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
        
        <div className="navbar-nav-container">
          <div className="tree-icon-container me-3">
            <div 
              className={`tree-icon ${!isAuthenticated ? 'disabled' : ''}`}
              onClick={handleCartClick}
              title={isAuthenticated ? "Моя заявка" : "Войдите для доступа к заявке"}
            >
              <img 
                src="/images/mock/user-icon.jpg" 
                alt="Заявка" 
                className={!isAuthenticated ? "grayscale" : ""}
              />
              {isAuthenticated && itemCount > 0 && (
                <div className="tree-count">
                  {itemCount > 9 ? '9+' : itemCount}
                </div>
              )}
            </div>
          </div>

          <Dropdown 
            show={showDropdown} 
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            className="navbar-dropdown"
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
                onClick={handleCatalogClick}
                className="navbar-dropdown-item"
              >
                Каталог аномалий
              </Dropdown.Item>

              {isAuthenticated ? (
                <>
                  <Dropdown.Item 
                    onClick={handleTreesClick}
                    className="navbar-dropdown-item"
                  >
                    Мои заявки
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={handleProfileClick}
                    className="navbar-dropdown-item"
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
                    onClick={handleLoginClick}
                    className="navbar-dropdown-item"
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
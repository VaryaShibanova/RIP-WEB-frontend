import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getCurrentUser, updateUserProfile, clearError } from '../slices/authSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('ProfilePage: Loading user data...');
    const loadUserData = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setHasLoaded(true);
      }
    };
    
    loadUserData();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      console.log('ProfilePage: User data loaded', user);
      setLogin(user.login || '');
    }
  }, [user]);

  // Если данные еще загружаются
  if (isLoading || !hasLoaded) {
    return <LoadingSpinner text="Загрузка профиля..." />;
  }

  // Если пользователь не авторизован после загрузки - редирект
  if (!isAuthenticated || !user) {
    console.log('ProfilePage: User not authenticated, redirecting to login');
    useEffect(() => {
      navigate('/login');
    }, [navigate]);
    
    return <LoadingSpinner text="Перенаправление на страницу входа..." />;
  }

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile({ login })).unwrap();
      setIsEditing(false);
    } catch (error) {
      // Ошибка обрабатывается в slice
    }
  };

  const handleCancel = () => {
    setLogin(user?.login || '');
    setIsEditing(false);
    dispatch(clearError());
  };

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Личный кабинет' }
      ]} />

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow profile-card">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">Личный кабинет</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-4">
                  <Row className="align-items-center">
                    <Col sm={4}>
                      <Form.Label className="fw-bold mb-0">Логин</Form.Label>
                    </Col>
                    <Col sm={8}>
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          isInvalid={!!error && error.includes('Логин')}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-value">{user?.login}</div>
                      )}
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Row className="align-items-center">
                    <Col sm={4}>
                      <Form.Label className="fw-bold mb-0">Роль</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <div className="profile-value profile-role">
                        {user?.is_moderator ? 'Модератор' : 'Пользователь'}
                      </div>
                    </Col>
                  </Row>
                </Form.Group>

                <div className="d-flex gap-2 justify-content-center mt-4">
                  {!isEditing ? (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className="px-4"
                    >
                      Редактировать
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        onClick={handleSave}
                        disabled={isLoading || login === user?.login}
                        className="px-4"
                      >
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-4"
                      >
                        Отмена
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
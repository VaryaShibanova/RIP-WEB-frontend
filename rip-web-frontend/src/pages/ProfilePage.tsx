import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getCurrentUser, updateUserProfile, clearError } from '../slices/authSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setLogin(user.login || '');
    }
  }, [user]);

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

  if (isLoading && !user) {
    return <LoadingSpinner text="Загрузка профиля..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Личный кабинет' }
      ]} />

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-dark text-white">
              <h4 className="mb-0">Личный кабинет</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>ID пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.id || ''}
                    disabled
                    plaintext
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={!isEditing}
                    isInvalid={!!error && error.includes('Логин')}
                  />
                  {!isEditing && (
                    <Form.Text className="text-muted">
                      Для изменения логина нажмите "Редактировать"
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Роль</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.is_moderator ? 'Модератор' : 'Пользователь'}
                    disabled
                    plaintext
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                    >
                      Редактировать
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        onClick={handleSave}
                        disabled={isLoading || login === user?.login}
                      >
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={isLoading}
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
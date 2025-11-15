import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, clearError } from '../slices/authSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // После успешной авторизации остаемся на той же странице
  // или можно перенаправить на главную
  useEffect(() => {
    if (isAuthenticated) {
      // Просто закрываем страницу логина или перенаправляем на главную
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!login || !password) {
      return;
    }

    try {
      await dispatch(loginUser({ login, password })).unwrap();
      // После успешного входа пользователь будет перенаправлен через useEffect
    } catch (error) {
      // Ошибка обрабатывается в slice
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Выполняется вход..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Авторизация' }
      ]} />

      <div className="d-flex justify-content-center align-items-center min-vh-80">
        <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="card-title">Вход в систему</h2>
              <p className="text-muted">Введите ваши учетные данные</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Логин</Form.Label>
                <Form.Control
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите ваш логин"
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите ваш пароль"
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={isLoading || !login || !password}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </Form>

            <div className="text-center">
              <span className="text-muted">Нет аккаунта? </span>
              <Link to="/register" className="text-decoration-none">
                Зарегистрироваться
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
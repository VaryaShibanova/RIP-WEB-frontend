import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { registerUser, clearError } from '../slices/authSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      dispatch(clearError());
      return;
    }

    const result = await dispatch(registerUser({
      login: formData.login,
      password: formData.password,
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Регистрация..." />;
  }

  return (
    <Container className="page-container">
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Регистрация' }
      ]} />

      <div className="d-flex justify-content-center">
        <Card style={{ width: '400px', background: 'rgba(255, 255, 255, 0.05)' }} className="p-4">
          <h2 className="text-center mb-4">Регистрация</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={25}
                placeholder="Введите логин (3-25 символов)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Введите пароль (минимум 6 символов)"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Подтверждение пароля</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Повторите пароль"
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={isLoading}
            >
              Зарегистрироваться
            </Button>

            <div className="text-center">
              <span>Уже есть аккаунт? </span>
              <Link to="/login">Войти</Link>
            </div>
          </Form>
        </Card>
      </div>
    </Container>
  );
};

export default RegisterPage;
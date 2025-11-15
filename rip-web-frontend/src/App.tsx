import { useEffect } from 'react';
import type { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import CustomNavbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnomaliesPage from './pages/AnomaliesPage';
import AnomalyDetailPage from './pages/AnomalyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TreePage from './pages/TreePage';
import TreeDetailPage from './pages/TreeDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAppDispatch } from './hooks/redux';
import { forceLogout } from './slices/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PublicRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // ПРИНУДИТЕЛЬНЫЙ СБРОС АВТОРИЗАЦИИ ПРИ КАЖДОЙ ПЕРЕЗАГРУЗКЕ
    dispatch(forceLogout());
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <CustomNavbar />
      <main className="flex-grow-1 py-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/anomalies/:id" element={<AnomalyDetailPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          
          {/* Protected routes - только для авторизованных */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/trees" element={
            <ProtectedRoute>
              <TreePage />
            </ProtectedRoute>
          } />
          <Route path="/trees/:id" element={
            <ProtectedRoute>
              <TreeDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={
            <div className="home-page">
              <Container className="page-container"> 
                <div className="text-center">
                  <h1 style={{ color: 'white', marginBottom: '30px' }}>404 - Страница не найдена</h1>
                  <p style={{ color: 'white' }}>Запрошенная страница не существует.</p>
                </div>
              </Container>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
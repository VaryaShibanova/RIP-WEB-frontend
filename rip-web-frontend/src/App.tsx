// App.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useEffect } from 'react';
import type { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { invoke } from "@tauri-apps/api/core";
import CustomNavbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnomaliesPage from './pages/AnomaliesPage';
import AnomalyDetailPage from './pages/AnomalyDetailPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: FC = () => {
  useEffect(() => {
    // Tauri команды для создания и закрытия
    invoke('tauri', {cmd:'create'})
      .then(() => {console.log("Tauri launched")})
      .catch(() => {console.log("Tauri not launched")});

    // Проверка доступности Tauri
    if ((window as any).__TAURI__) {
      console.log('Tauri is available');
    } else {
      console.log('Running in browser mode');
    }

    // Функция очистки при размонтировании компонента
    return () => {
      invoke('tauri', {cmd:'close'})
        .then(() => {console.log("Tauri closed")})
        .catch(() => {console.log("Tauri close failed")});
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <CustomNavbar />
      <main className="flex-grow-1 py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/anomalies/:id" element={<AnomalyDetailPage />} />
          <Route path="/my-request" element={
            <div className="home-page">
              <Container className="page-container"> 
                <div className="text-center">
                  <h1 style={{ color: 'white', marginBottom: '30px' }}>Моя заявка</h1>
                  <p style={{ color: 'white' }}>Страница в разработке...</p>
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
// App.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useEffect } from 'react';
import type { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
// УДАЛИТЬ импорт Provider и store
import CustomNavbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnomaliesPage from './pages/AnomaliesPage';
import AnomalyDetailPage from './pages/AnomalyDetailPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: FC = () => {
  useEffect(() => {
    if ((window as any).TAURI) {
      console.log('Tauri is available');
    } else {
      console.log('Running in browser mode');
    }
  }, []);

  return (
    // УДАЛИТЬ Provider - он уже в main.tsx
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
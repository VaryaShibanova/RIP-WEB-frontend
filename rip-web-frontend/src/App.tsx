import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import CustomNavbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnomaliesPage from './pages/AnomaliesPage';
import AnomalyDetailPage from './pages/AnomalyDetailPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <CustomNavbar />
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
      </div>
    </Router>
  );
};

export default App;
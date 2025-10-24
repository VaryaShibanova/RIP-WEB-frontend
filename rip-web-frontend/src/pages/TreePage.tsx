{/*import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import type { TreeDetailResponse } from '../types'; // Добавьте type
import { apiService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';

const TreePage: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTree();
      setTreeData(data);
    } catch (error) {
      console.error('Error loading tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center" style={{ color: 'white', padding: '50px' }}>
          Загрузка заявки...
        </div>
      </Container>
    );
  }

  if (!treeData) {
    return (
      <Container>
        <div className="text-center" style={{ color: 'white', padding: '50px' }}>
          Заявка не найдена
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Моя заявка на исследование' }
      ]} />

      <Row className="my-4">
        <Col>
          <h1 className="main-title">заявка на исследование</h1>
        </Col>
      </Row>*/}

import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <Breadcrumb>
      {items.map((item, index) => (
        index === items.length - 1 ? (
          <Breadcrumb.Item key={index} active>
            {item.label}
          </Breadcrumb.Item>
        ) : (
          <LinkContainer key={index} to={item.path || '/'}>
            <Breadcrumb.Item>
              {item.label}
            </Breadcrumb.Item>
          </LinkContainer>
        )
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Input, Typography, Button, Space } from 'antd';
import moment from 'moment';
import { statusTranslations } from './statusTranslations';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';

const Pedidos = () => {
  const { Title } = Typography;
  const { Search } = Input;
  const consumerKey = 'ck_59530ab8222e73b3d69b7a720ededbdb3dbcc80c';
  const consumerSecret = 'cs_d1a0be673a61d39076ca61668b0871441bfec700';
  const siteUrl = 'https://elgatoconbolsas.es';

  const fetchOrders = async () => {
    const response = await axios.get(`${siteUrl}/wp-json/wc/v3/orders`, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    });
    return response.data;
  };

  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getOrders = async () => {
      const ordersData = await fetchOrders();
      setOrders(ordersData);
    };

    getOrders();
  }, []);
  const columns = [
    {
      title: 'ID de Pedido',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Cliente',
      key: 'customer',
      render: (order) => `${order.billing.first_name} ${order.billing.last_name}`,
    },
    {
      title: 'Productos',
      key: 'products',
      render: (order) => (
        <ul>
          {order.line_items.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} key={status}>
          {statusTranslations[status] || status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date_created',
      key: 'date_created',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (order) => (
        <Space size="middle">
          <Link to={`${siteUrl}/wp-admin/post.php?post=${order.id}&action=edit`}>
            {' '}
            {/* Link to order edit page */}
            <Button type="primary">Ver Detalle</Button>
          </Link>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.billing.first_name.toLowerCase()} ${order.billing.last_name.toLowerCase()}`;
    return fullName.includes(searchQuery.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'pending':
        return 'gold';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white p-10 overflow-hidden rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Pedidos de la Web</Title>
        <div className="flex items-center">
          <Button
            type="primary"
            href="https://elgatoconbolsas.es/wp-admin"
            style={{ marginRight: '0.5rem' }}
          >
            Administrar web
          </Button>
          <div className="flex-1">
            <Search
              placeholder="Buscar por cliente"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Pedidos;

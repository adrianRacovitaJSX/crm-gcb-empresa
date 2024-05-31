import React, { useState, useEffect } from 'react';
import { Table, Typography, Input, Button, Space, Dropdown, Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

function LeadsWeb() {
  const { Title } = Typography;
  const { Text } = Typography;

  // Estados para almacenar los datos del formulario, estado de carga, error y texto de búsqueda
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(''); 

  useEffect(() => {
    // Función para obtener los datos del formulario a través de la API
    const fetchFormData = async () => {
      try {
        const response = await fetch('https://elgatoconbolsas.es/wp-json/frm/v2/entries', {
          headers: {
            Authorization: 'Basic ' + btoa('KC35-YDH2-1I43-NT1O:DUnmSW18BlV3rVfXcA'), // Autenticación básica
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP! Estado: ${response.status}`);
        }

        const data = await response.json();

        // Convertir el objeto de entradas a un array
        const entries = Object.values(data);
        setFormData(entries); 
      } catch (err) {
        setError(err.message);
        console.error('Error al obtener o procesar los datos del formulario:', err);
      } finally {
        setIsLoading(false); // Finalizar el estado de carga
      }
    };

    fetchFormData(); // Llamar a la función al montar el componente
  }, []); 

  // Definición de las columnas de la tabla
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Consulta',
      dataIndex: ['meta', '9jv0r1'],
      key: 'message',
      width: 50, 
      render: (message) => {
        // Lógica para truncar el mensaje si es demasiado largo
        const maxLength = 100; 
        const shouldTruncate = message && message.length > maxLength;

        return (
          <div>
            <Text ellipsis={shouldTruncate}>
              {shouldTruncate ? `${message.substring(0, maxLength)}...` : message}
            </Text>
            {shouldTruncate && (
              <Button type="link" onClick={() => alert(message)}>
                Ver más
              </Button>
            )}
          </div>
        );
      },
    },
    { title: 'Fecha', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Dropdown // Menú desplegable para las acciones
          overlay={
            <Menu>
              <Menu.Item key="1">
                <a
                  href={`https://elgatoconbolsas.es/wp-admin/admin.php?page=formidable-entries&frm_action=edit&id=${record.id}`}
                  target="_blank"
                >
                  Ver entrada
                </a>
              </Menu.Item>
              <Menu.Item key="2">
                <a href={`mailto:${record.meta['29yf4d']}`} target="_blank">
                  Responder
                </a>
              </Menu.Item>
            </Menu>
          }
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space className="items-center align-middle p-5">
              <PlusOutlined />
            </Space>
          </a>
        </Dropdown>
      ),
    },
  ];

  // Filtrar los datos en función del texto de búsqueda
  const filteredData = formData.filter((entry) =>
    Object.values(entry).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="bg-white p-10 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <Title level={2}>Leads de la Web</Title>
        <div className="flex items-center">
          <Button type="primary" href="https://elgatoconbolsas.es/wp-admin" style={{ marginRight: '0.5rem' }}>
            Administrar web
          </Button>
          <div className="flex-1">
            <Input.Search // Barra de búsqueda
              placeholder="Búsqueda por usuario"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mostrar mensaje de carga, error o la tabla de datos */}
      {isLoading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <Table 
          columns={columns}
          dataSource={filteredData} 
          rowKey="id"
          pagination={{ pageSize: 10 }} 
          scroll={{ x: 1000 }} 
        />
      )}
    </div>
  );
}

export default LeadsWeb;

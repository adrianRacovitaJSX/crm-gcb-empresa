import { useEffect, useState } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  RedoOutlined,
  PlusOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { generate as uniqueId } from 'shortid';
import { useNavigate } from 'react-router-dom';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

function AddNewItem({ config }) {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity } = config;

  const handleInvoiceClick = () => {
    navigate(`/crear-factura`);
  };

  const handleQuoteClick = () => {
    navigate(`/crear-albaran`);
  };

  if (entity === 'invoice') {
    return (
      <Button onClick={handleInvoiceClick} type="primary" icon={<PlusOutlined />}>
        {ADD_NEW_ENTITY}
      </Button>
    );
  } 
  
  if (entity === 'quote') {
    return (
    <Button onClick={handleQuoteClick} type="primary" icon={<PlusOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
    );
  };
}

export default function DataTable({ config, extra = [] }) {
  const translate = useLanguage();
  const { Search } = Input; // Import Search component from Ant Design
  let { entity, dataTableColumns, disableAdd = false } = config;

  const { DATATABLE_TITLE } = config;

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    {
      label: translate('Download'),
      key: 'download',
      icon: <FilePdfOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },
    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const navigate = useNavigate();

  const handleRead = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${entity}/read/${record._id}`);
  };
  const handleEdit = (record) => {
    const data = { ...record };
    dispatch(erp.currentAction({ actionType: 'update', data }));
    navigate(`/${entity}/update/${record._id}`);
  };
  const handleDownload = (record) => {
    window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
  };

  const handleDelete = (record) => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  const handleRecordPayment = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/invoice/pay/${record._id}`);
  };

  dataTableColumns = [
    ...dataTableColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;
                case 'download':
                  handleDownload(record);
                  break;
                case 'delete':
                  handleDelete(record);
                  break;
                case 'recordPayment':
                  handleRecordPayment(record);
                  break;
                default:
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(erp.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(erp.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  // State to hold the value of the search input
  const [searchValue, setSearchValue] = useState('');

  // Function to handle search input change
  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  // Function to filter dataSource based on searchValue
  const filteredDataSource = dataSource.filter((item) => {
    const clientName = item.client ? item.client.name.toLowerCase() : '';
    const invoiceNumber = item.number ? item.number.toString() : ''; // Convert invoice number to string for comparison
    return clientName.includes(searchValue.toLowerCase()) || invoiceNumber.includes(searchValue);
  });

  return (
    <>
      <PageHeader
        title={DATATABLE_TITLE}
        ghost={true}
        extra={[
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,
          !disableAdd && <AddNewItem config={config} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Search
            placeholder="Busca por cliente o nº de factura"
            onChange={handleSearch}
            value={searchValue}
            style={{ width: '300px', marginBottom: '10px' }}
          />
          <span style={{ alignSelf: 'flex-start', fontSize: '12px', color: '#999' }}>
            Solo busca en la página actual, si necesitas más información aumenta el número de
            facturas que se muestran a 100, o ve cambiando de página.
          </span>
        </div>
      </PageHeader>

      <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={filteredDataSource} // Use filteredDataSource instead of dataSource
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
      />
    </>
  );
}
import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { tagColor } from '@/utils/statusTagColor';
import { useMoney, useDate } from '@/settings';
import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';

export default function Invoice() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'invoice';
  const { moneyFormatter } = useMoney();
  
  // State to hold current filters
  const [filters, setFilters] = useState({});

  const handleFilterChange = (filters) => {
    setFilters(filters);
  };

  // Sample data. Replace this with your actual data.
  const data = [
    { client: { name: 'A. LUIS MARTIN MONTERO' } },
    { client: { name: 'ALEXANDRU DRAGOS SIROE' } },
    { client: { name: 'ALFONSO ESTEBAN MUNICIO' } },
    { client: { name: 'ANTONIO LÓPEZ RUIZ' } },
    { client: { name: 'ARROYO MAR SUPER S.L.U' } },
    { client: { name: 'AVANTI EXPRESS S.L' } },
    { client: { name: 'BEATRIZ REVILLA SANCHEZ' } },
    { client: { name: 'BUTCHER SHOP LIFE MADRID S.L' } },
    { client: { name: 'C.JOAQUIN' } },
    { client: { name: 'CARNICAS BAEZ S.L' } },
    { client: { name: 'CARNICAS MARTÍN CARO S.L' } },
    { client: { name: 'CARNICAS MARTÍN SANCHEZ S.L' } },
    { client: { name: 'CARNICAS POLO GARCIA S.L' } },
    { client: { name: 'CARNICAS POLO S.L' } },
    { client: { name: 'CARNICERIA JOAQUIN' } },
    { client: { name: 'CARNICERIA VALTIETAR S.L' } },
    { client: { name: 'CASQUERIA GARCIA C.B' } },
    { client: { name: 'CHARCUTERÍA LA TRADICION C.B' } },
    { client: { name: 'COME BIEN Y SANO S.L' } },
    { client: { name: 'DAVID ARNAL GONZALEZ' } },
    { client: { name: 'EDER PEREZ CHANGO BAYRON' } },
    { client: { name: 'EDUARDO WADY TARBAY MORALES' } },
    { client: { name: 'FRANCISCO CARRILLO CABALLERO' } },
    { client: { name: 'FRANCISCO MARIN CAÑIZARES' } },
    { client: { name: 'FRUTAS Y VERDURAS MOSTOLES' } },
    { client: { name: 'GACOMALI S.L' } },
    { client: { name: 'GRUPO HOSTELERO LEON 5 S.L.U' } },
    { client: { name: 'GRUPO PLÁSTICO VELASCO S.L' } },
    { client: { name: 'JAMONERIAS HERMANOS MANZANO' } },
    { client: { name: 'JAVIER PRIEGO ORTEGA' } },
    { client: { name: 'JOSE ALBERTO SANCHEZ ZAPATA' } },
    { client: { name: 'JOSE LUIS VADILLO ORTIZ' } },
    { client: { name: 'LOCO AULLADOR S.L' } },
    { client: { name: 'MANTSARIAS S.L' } },
    { client: { name: 'MARIA VELASCO CABRERA' } },
    { client: { name: 'MERCADO PRINCIPE DE ASTURIAS C.B' } },
    { client: { name: 'MIGUEL ANGEL LOPEZ LOPEZ' } },
    { client: { name: 'MIGUEL TORRES PEÑA' } },
    { client: { name: 'MIGUEL WILKING SANCHEZ ARIAS' } },
    { client: { name: 'PESCADOS Y MARISCOS DEL PUERTO C.B' } },
    { client: { name: 'POLLOS TEO S.L' } },
    { client: { name: 'POLLOS VELILLA S.L' } },
    { client: { name: 'PruebaAdrian' } },
    { client: { name: 'PRODUCTOS SEYCAR S.L' } },
    { client: { name: 'PROINSTALLER S.L' } },
    { client: { name: 'RIALSEAFOODD S.L' } },
    { client: { name: 'RUBEN MERINO BRASERO' } },
    { client: { name: 'SANCHEZ FISHING S.L.U' } },
    { client: { name: 'SANTIAGO LIMIA SANCHEZ' } },
    { client: { name: 'SOLUCIONES COME SANO S.L' } },
    { client: { name: 'THE KING OF CHICKEN R&P KOC FOOD S.L' } },
    { client: { name: 'ZAESPAN S.L' } },
  ];

  // Extract unique client names from the data for filter options
  const clientFilters = useMemo(() => {
    const uniqueClients = [...new Set(data.map(item => item.client.name))];
    return uniqueClients.map(client => ({ text: client, value: client }));
  }, [data]);

  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
      filters: clientFilters, // Assign filters to the column
      onFilter: (value, record) => record.client.name === value,
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: 'Subtotal',
      dataIndex: 'total',
      render: (total) => moneyFormatter({ amount: total }),
    },
    {
      title: "Pagado",
      dataIndex: 'credit',
      render: (credit) => moneyFormatter({ amount: credit }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => {
        let tagStatus = tagColor(status);
        return (
          <Tag color={tagStatus.color}>
            {status && translate(tagStatus.label)}
          </Tag>
        );
      },
    },
    {
      title: translate('Payment'),
      dataIndex: 'paymentStatus',
      render: (paymentStatus) => {
        let tagStatus = tagColor(paymentStatus);
        return (
          <Tag color={tagStatus.color}>
            {paymentStatus && translate(paymentStatus)}
          </Tag>
        );
      },
    },
  ];

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['number', 'client.name'];

  const Labels = {
    PANEL_TITLE: translate('invoice'),
    DATATABLE_TITLE: translate('invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_invoice'),
    ENTITY_NAME: translate('invoice'),
    RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <InvoiceDataTableModule
      config={config}
      filters={filters} // Pass filters state to child component
      onFilterChange={handleFilterChange} // Pass filter change handler
      data={data} // Pass the actual data to the child component
    />
  );
}

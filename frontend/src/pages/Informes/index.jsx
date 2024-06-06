import React from 'react';
import InvoiceChart from './components/invoice-chart';
import QuoteChart from './components/albaran-chart';

const Informes = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '20px',
        }}
      >
        <div>
          <h1 className="text-2xl font-bold">Facturación en facturas</h1>
          <InvoiceChart />
        </div>
      </div>
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '20px',
          marginTop: '40px',
        }}
      >
        <div>
          <h1 className="text-2xl font-bold">Facturación en albaranes</h1>
          <QuoteChart />
        </div>
      </div>
    </>
  );
};

export default Informes;

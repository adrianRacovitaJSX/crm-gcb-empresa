import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const InvoiceChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const currentYear = new Date().getFullYear();
        const labels = [];
        const amounts = [];
        const backgroundColors = [];

        for (const month of months) {
          const monthIndex = months.indexOf(month) + 1;
          const formattedMonth = `${currentYear}-${monthIndex.toString().padStart(2, '0')}`;

          try {
            const response = await axios.get('/invoice/summary', {
              params: {
                type: 'month',
                month: formattedMonth,
              },
            });

            const data = response.data.result;

            if (data) {
              labels.push(month);
              amounts.push(data.total);
              backgroundColors.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`);
            } else {
              labels.push(month);
              amounts.push(0);
              backgroundColors.push('rgba(200, 200, 200, 0.6)');
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              labels.push(month);
              amounts.push(0);
              backgroundColors.push('rgba(200, 200, 200, 0.6)');
            } else {
              throw error;
            }
          }
        }

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Total Facturado',
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors,
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching invoice summary data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current && chartData) {
      const ctx = chartRef.current.getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value}€`,
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
        },
      });

      return () => {
        newChart.destroy();
      };
    }
  }, [chartData]);

  return <canvas ref={chartRef} />;
};

export default InvoiceChart;
import { Tag, Divider, Row, Col, Spin, Tooltip, ConfigProvider } from 'antd';
import { useMoney } from '@/settings';
import { DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt } from 'react-icons/fa';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Import corresponding Day.js locale 

export default function AnalyticSummaryCard({
  title,
  tagContent,
  tagColor,
  prefix,
  isLoading = false,
  month = null,
}) {
  const { moneyFormatter } = useMoney();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const formatEuro = (amount) => {
    return (
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(amount)
        .replace('€', '') + '€'
    ); // Remove default € and add custom symbol
  };

  const fetchInvoiceSummary = async (month) => {
    try {
      setLoading(true);
      const response = await axios.get('/invoice/summary', {
        params: { type: 'month', month: month ? month.format('YYYY-MM') : null },
      });
      setSummaryData(response.data.result);
    } catch (error) {
      console.error('Error fetching invoice summary:', error.response);

      // Display specific error to the user
      if (error.response && error.response.data) {
        alert(error.response.data.message); // Or display in a more user-friendly way
      } else {
        alert('An error occurred while fetching invoice summary.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    fetchInvoiceSummary(date);
    console.log('Button clicked, date selected:', date);
  };

  useEffect(() => {
    fetchInvoiceSummary(selectedMonth);
  }, [selectedMonth]); // Fetch data whenever selectedMonth changes

  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 12 }}
      md={{ span: 12 }}
      lg={{ span: 6 }}
    >
      <div
        className="whiteBox shadow"
        style={{ color: '#595959', fontSize: 13, minHeight: '106px', height: '100%' }}
      >
        <div className="pad15 strong" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <h3
            style={{
              color: '#22075e',
              fontSize: 'large',
              margin: '5px 0',
              textTransform: 'capitalize',
            }}
          >
            {title}
          </h3>
        </div>
        <Divider style={{ padding: 0, margin: 0 }}></Divider>
        <div className="pad15">
          <Row gutter={[0, 0]} justify="space-between" wrap={false}>
            <Col
              className="gutter-row"
              flex="85px"
              style={{ textAlign: 'left' }}
              onClick={() => setIsDatePickerOpen(true)}
            >
              <ConfigProvider locale={esES}>
                <DatePicker
                  placeholder="Actual"
                  className=""
                  style={{
                    width: '100%',
                    position: 'absolute',
                    top: '100%', // Position at the bottom of the prefix
                    left: 0,
                    zIndex: 1, // Ensure it's on top
                    marginTop: '-27px'
                  }}
                  picker="month"
                  value={selectedMonth}
                  onChange={(date) => {
                    handleMonthChange(date);
                    setIsDatePickerOpen(false);
                  }}
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen} // Close on panel change
                  allowClear={false}
                  format="MMMM"
                />
              </ConfigProvider>
            </Col>
            <Divider
              style={{
                height: '100%',
                padding: '10px 0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              type="vertical"
            ></Divider>
            <Col
              className="gutter-row"
              flex="auto"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isLoading ? (
                <Spin />
              ) : (
                <Tooltip title={tagContent}>
                  <Tag
                    color={tagColor}
                    style={{
                      margin: '0 auto',
                      justifyContent: 'center',
                      maxWidth: '110px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {summaryData ? formatEuro(summaryData.total) : formatEuro(0)}{' '}
                    {/* Use local function */}
                  </Tag>
                </Tooltip>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </Col>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';

function useSummaryData(endpoint) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const fetchSummary = async (month) => {
    try {
      setLoading(true);
      const response = await axios.get(endpoint, {
        params: {
          type: 'month',
          month: month ? month.format('YYYY-MM') : null,
        },
      });
      setSummaryData(response.data.result);
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error.response);
      // ... error handling (e.g., display error to user)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedMonth);
  }, [selectedMonth, endpoint]); // Fetch on mount and when month or endpoint changes

  return { summaryData, loading, selectedMonth, setSelectedMonth };
}

export default useSummaryData;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export const useConversionFunnel = () => {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchFunnelData = async (customDateRange = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const range = customDateRange || dateRange;
      const params = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const response = await axios.get(`${BASE_URL}/get-funnel-data`, { params });
      
      if (response.data.success) {
        setFunnelData(response.data);
      } else {
        setError('Failed to load funnel data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversion funnel data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const updateDateRange = (newDateRange) => {
    setDateRange(newDateRange);
    fetchFunnelData(newDateRange);
  };

  return { 
    funnelData, 
    loading, 
    error, 
    fetchFunnelData, 
    dateRange,
    updateDateRange 
  };
};
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export const useActivityLibrary = (page = 1, limit = 10) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchActivities = async (page, limit) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/get-all-activity-library`, {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setActivities(response.data.activities);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activities');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(page, limit);
  }, [page, limit]);

  return { 
    activities, 
    loading, 
    error, 
    pagination,
    refetch: fetchActivities 
  };
};
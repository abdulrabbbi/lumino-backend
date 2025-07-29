import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function useGetAllActivities(filter) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    completed: 0,
    draft: 0
  });

  const fetchActivities = useCallback(async () => {
    const token = localStorage.getItem('adminAuthToken');
    try {
      setLoading(true);
      
      const countsResponse = await axios.get(`${BASE_URL}/get-activity-counts`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCounts(countsResponse.data);

      const response = await axios.get(`${BASE_URL}/get-all-activities`, {
        params: { filter },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setActivities(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refetch = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, counts, refetch };
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export const useActivity = (id) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-single-activity/${id}`, {
            headers:{
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        setActivity(response.data.activity);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const markAsCompleted = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/mark-activity-as-completed/${id}`, {}, {
        headers:{
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setActivity(prev => ({ ...prev, status: "Voltooid" }));
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to mark as completed';
    }
  };

  return { activity, loading, error, markAsCompleted };
};
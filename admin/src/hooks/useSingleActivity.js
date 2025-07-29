import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';


export const useSingleActivity = (id) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-single-activity/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
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

  return { activity, loading, error };
};
// hooks/useProgressStats.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export const useProgressStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressStats = async () => {
      try {
        const token = localStorage.getItem('authToken'); // assuming 'token' is the key

        const response = await axios.get(`${BASE_URL}/get-progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressStats();
  }, []);

  return { stats, loading, error };
};


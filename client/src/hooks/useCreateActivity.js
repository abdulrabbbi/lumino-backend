import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function useCreateActivity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createActivity = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken'); 

      const response = await axios.post(`${BASE_URL}/create-activity`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Something went wrong');
      throw err;
    }
  };

  return { createActivity, loading, error };
}

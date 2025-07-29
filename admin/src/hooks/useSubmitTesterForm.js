import axios from 'axios';
import { useState } from 'react';
import { BASE_URL } from '../utils/api';

export default function useSubmitTesterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitTesterForm = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${BASE_URL}/submit-tester-form`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, message: res.data.message || 'Form submitted successfully' };
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { submitTesterForm, loading, error };
}

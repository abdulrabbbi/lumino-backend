import axios from 'axios';
import { BASE_URL } from '../utils/api';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function useAdminActivityActions() {
  const token = localStorage.getItem('authToken');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const deleteActivity = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${BASE_URL}/delete-activity/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data || error.message);
      throw error;
    }
    finally {
      setLoading(false);
    }
  };

  const editActivity = async (id, updates) => {
    setLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/edit-activity/${id}`, updates, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error editing activity:", error?.response?.data || error.message);
      throw error;
    }
    finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/create-activity`, activityData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      toast.success('Activity has been created');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Er is iets misgegaan');
      toast.error(err.response?.data?.error || 'Er is iets misgegaan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBulkActivities = async (bulkData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/create-bulk-activities`, bulkData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      toast.success(`${response.data.activities.length} total activities has been created`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Er is iets misgegaan');
      toast.error(err.response?.data?.error || 'Er is iets misgegaan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteActivity,
    editActivity,
    loading,
    error,
    createActivity, createBulkActivities
  };
}

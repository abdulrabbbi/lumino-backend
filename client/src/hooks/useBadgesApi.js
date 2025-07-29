/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function useBadgesApi() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/get-all-badges`);  
      setBadges(res.data);
    } catch (err) {
      console.error('Fetch badges error:', err);
      setError(err.message || 'Error fetching badges');
    } finally {
      setLoading(false);
    }
  };

  const createBadge = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/create-badge`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBadges((prev) => [res.data.badge, ...prev]);
    } catch (err) {
      console.error('Create badge error:', err);
      setError(err.message || 'Error creating badge');
    } finally {
      setLoading(false);
    }
  };

  const updateBadge = async (id, updatedData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${BASE_URL}/update-badge/${id}`, updatedData);
      setBadges((prev) =>
        prev.map((badge) => (badge._id === id ? res.data.badge : badge))
      );
    } catch (err) {
      console.error('Update badge error:', err);
      setError(err.message || 'Error updating badge');
    } finally {
      setLoading(false);
    }
  };

  const deleteBadge = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/delete-badge/${id}`);
      setBadges((prev) => prev.filter((badge) => badge._id !== id));
    } catch (err) {
      console.error('Delete badge error:', err);
      setError(err.message || 'Error deleting badge');
    } finally {
      setLoading(false);
    }
  };

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge,
  };
}

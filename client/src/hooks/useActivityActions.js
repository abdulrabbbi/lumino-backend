/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useCallback } from 'react';
import { BASE_URL } from '../utils/api';

export default function useActivityActions(setActivities) {
    let token = localStorage.getItem('authToken');
  const approveActivity = useCallback(async (id) => {
    try {
      const res = await axios.post(`${BASE_URL}/approve-activity/${id}`, {
        isApproved: true,
        status: 'Actief'
      }, {
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
      });

      setActivities(prev =>
        prev.map(act => act._id === id ? { ...act, isApproved: true } : act)
      );
      return res.data.message;
    } catch (err) {
      throw err.response?.data?.error || 'Fout bij goedkeuren';
    }
  }, [setActivities]);

  const deleteActivity = useCallback(async (id) => {
    try {
      await axios.delete(`${BASE_URL}/delete-parents-activity/${id}`, {
        headers: {
            'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      });
      setActivities(prev => prev.filter(act => act._id !== id));
      return 'Activiteit verwijderd';
    } catch (err) {
      throw err.response?.data?.error || 'Fout bij verwijderen';
    }
  }, [setActivities]);

  const editActivity = useCallback(async (id, data) => {
    try {
      const res = await axios.put(`${BASE_URL}/edit-parents-activity/${id}`, data, {
        headers: {
            'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      });
      setActivities(prev =>
        prev.map(act => act._id === id ? res.data.activity : act)
      );
      return 'Activiteit bijgewerkt';
    } catch (err) {
      throw err.response?.data?.error || 'Fout bij bewerken';
    }
  }, [setActivities]);

  return { approveActivity, deleteActivity, editActivity };
}

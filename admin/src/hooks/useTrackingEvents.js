import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

const useTrackingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrackingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/get-all-tracking-events`);
      
      if (response.data.success) {
        setEvents(response.data.events || []);
      } else {
        throw new Error('Failed to fetch tracking events');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching tracking events');
      console.error('Error fetching tracking events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingEvents();
  }, []);

  const refetch = () => {
    fetchTrackingEvents();
  };

  return {
    events,
    loading,
    error,
    refetch
  };
};

export default useTrackingEvents;
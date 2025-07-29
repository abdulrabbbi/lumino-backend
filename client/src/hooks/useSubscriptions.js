import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get-all-subscriptions`); 
        setSubscriptions(res.data);  
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return { subscriptions, loading };
}

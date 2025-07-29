import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function usePendingApprovalActivitiesAdmin(page = 1, limit = 10) {
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/get-all-parent-approval-activities`, {
          params: { page, limit }
        });
        setActivities(res.data || []);
        setTotalActivities(res.data.total || 0); 
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [page, limit]);

  return { activities, totalActivities, loading, setActivities };
}

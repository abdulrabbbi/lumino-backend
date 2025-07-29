import { toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export const useMarkActivityCompleted = () => {
  const markCompleted = async (activityId) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await axios.post(
        `${BASE_URL}/mark-activity-as-completed/${activityId}`,
        {}, // No body required
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Activity marked as completed successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark activity as completed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { markCompleted };
};

export const useRateActivity = () => {
  const rateActivity = async (activityId, rating) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await axios.post(
        `${BASE_URL}/rate-activity/${activityId}`,
        { value: rating }, // Body goes here
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Rating submitted successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit rating';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { rateActivity };
};

import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

const useAdminPendingRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminAuthToken')}`
    }
  });

  const getPendingRequests = async (communityId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/get-all-pending-requests-for-community/${communityId}`, { 
        params 
      });
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch pending requests';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (communityId, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/process-request/${communityId}`, data);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve/reject requests
  const bulkProcessRequests = async (communityId, requests, action, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const promises = requests.map(request => 
        processRequest(communityId, {
          action,
          requestId: request._id,
          userId: request.user._id,
          reason
        })
      );
      
      const results = await Promise.allSettled(promises);
      return results;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to bulk process requests';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPendingRequests,
    processRequest,
    bulkProcessRequests
  };
};

export default useAdminPendingRequests;
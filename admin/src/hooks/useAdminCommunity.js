import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';


const useAdminCommunity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminAuthToken')}`
    }
  });

  // Community Management
  const getCommunities = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/get-all-communities-for-admin', { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch communities');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/create-community', data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create community');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCommunity = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/update-community/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update community');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunity = async (id, action = 'archive') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/delete-community/${id}`, {
        data: { action }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete community');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Community Stats
  const syncCommunityStats = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get-community-stats/${id}/sync-stats`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync stats');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCommunityAnalytics = async (id, period = '30d') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get-community-analytics/${id}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Member Management
  const getCommunityMembers = async (id, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get-community-members/${id}/members`, { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch members');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/add-member/${id}/members`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (communityId, memberId, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/update-member/${communityId}/members/${memberId}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (communityId, memberId, ban = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/remove-member/${communityId}/members/${memberId}`, {
        data: { ban }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Post Management
  const getCommunityPosts = async (id, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get-community-posts/${id}/posts`, { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch posts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const managePost = async (communityId, postId, action, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/manage-community-posts/${communityId}/posts/${postId}`, {
        action,
        reason
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to manage post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Comment Management
  const getPostComments = async (postId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get-post-comments/${postId}/comments`, { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch comments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const manageComment = async (commentId, action, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/manage-comments/${commentId}`, {
        action,
        reason
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to manage comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Community methods
    getCommunities,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    syncCommunityStats,
    getCommunityAnalytics,
    // Member methods
    getCommunityMembers,
    addMember,
    updateMember,
    removeMember,
    // Post methods
    getCommunityPosts,
    managePost,
    // Comment methods
    getPostComments,
    manageComment
  };
};

export default useAdminCommunity;
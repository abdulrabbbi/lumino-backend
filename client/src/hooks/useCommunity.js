/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../utils/api';
import axios from 'axios';

export const useCommunity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Get all communities ()
  const getAllCommunities = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/get-all-communities-public`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search || ''
        } , headers: { ...getAuthHeaders()}
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch communities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single community ()
  const getCommunity = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/get-single-community-public/${id}`, {headers: { ...getAuthHeaders()}});
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch community');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's joined communities (requires auth)
  const getUserCommunities = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/communities/get-user-communities`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20
        },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user communities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join community (requires auth)
  const joinCommunity = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${BASE_URL}/join-community/${id}/join`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join community');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave community (requires auth)
  const leaveCommunity = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${BASE_URL}/leave-community/${id}/leave`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave community');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create post (requires auth) - UPDATED VERSION
  const createPost = useCallback(async (communityId, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${BASE_URL}/create-post/${communityId}/posts`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get community posts (requires auth)
  const getCommunityPosts = useCallback(async (communityId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/get-posts/${communityId}/posts`,
        {
          params: {
            page: params.page || 1,
            limit: params.limit || 20
          },
          headers: getAuthHeaders()
        }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch posts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle like (requires auth)
  const toggleLike = useCallback(async (postId, type = 'like') => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${BASE_URL}/toggle-like/${postId}/like`,
        { type },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle like');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add comment (requires auth)
  const addComment = useCallback(async (postId, commentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${BASE_URL}/add-comment/${postId}/comments`,
        commentData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get comments (requires auth)
  const getComments = useCallback(async (postId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/get-comment/${postId}/comments`,
        {
          params: {
            page: params.page || 1,
            limit: params.limit || 50
          },
          headers: getAuthHeaders()
        }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch comments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllCommunities,
    getCommunity,
    getUserCommunities,
    joinCommunity,
    leaveCommunity,
    createPost,
    getCommunityPosts,
    toggleLike,
    addComment,
    getComments
  };
};
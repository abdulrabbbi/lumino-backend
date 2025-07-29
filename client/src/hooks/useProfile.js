import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function useProfile() {
    const [profile, setProfile] = useState({
        firstName: '',
        surname: '',
        email: '',
        createdAt: ''
      });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log(token);
        
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/get-user-info`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return { profile, loading };
}

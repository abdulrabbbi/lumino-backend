import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/api";

export default function useUserBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/get-user-badges`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBadges(res.data.badges || []);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return { badges, loading };
}

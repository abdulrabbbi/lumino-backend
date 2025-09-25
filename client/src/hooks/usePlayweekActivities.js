// src/hooks/usePlayweekActivities.js
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../utils/api";

const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export function usePlayweekActivities() {
  const userTimezone = getUserTimezone();
  console.log('user timezone', userTimezone);
  
 
  const [playweekActivities, setPlayweekActivities] = useState([]);
  const [weekInfo, setWeekInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayweekActivities = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${BASE_URL}/get-playweek-activities`, {
          headers: {
           'User-Timezone': userTimezone,
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (data.success) {
          setPlayweekActivities(data.activities);
          setWeekInfo(data.weekInfo); // ✅ Set weekInfo from backend response
        } else {
          throw new Error(data.message || "Failed to load playweek activities");
        }
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Something went wrong";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayweekActivities();
  }, []);

  return { playweekActivities, weekInfo, loading, error };
}
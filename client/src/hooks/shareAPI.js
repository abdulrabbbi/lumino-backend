// shareAPI.js
import axios from "axios";
import { BASE_URL } from "../utils/api";


export const checkShareLimit = async () => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) return false;

  try {
    const response = await axios.get(`${BASE_URL}/check-share-limit`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.hasSharedThisWeek;
  } catch (error) {
    console.error("Error checking share limit:", error);
    return false;
  }
};

export const recordActivityShare = async (activityId) => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) return false;

  try {
    const response = await axios.post(
      `${BASE_URL}/record-activity-share`,
      { activityId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return response.data.success;
  } catch (error) {
    console.error("Error recording share:", error);
    return false;
  }
};

export const getUserShareHistory = async () => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) return [];

  try {
    const response = await axios.get(`${BASE_URL}/user-share-history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.shareHistory || [];
  } catch (error) {
    console.error("Error fetching share history:", error);
    return [];
  }
};
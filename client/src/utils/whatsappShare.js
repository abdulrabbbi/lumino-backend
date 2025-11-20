import axios from 'axios';
import { BASE_URL } from './api';

// Check if user has already shared an activity this week via API
export const hasSharedActivityThisWeek = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return false;

  try {
    const response = await axios.get(`${BASE_URL}/check-share-limit`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.hasSharedThisWeek;
  } catch (error) {
    console.error('Error checking share limit:', error);
    return false;
  }
};

// Record activity share via API
export const recordActivityShare = async (activityId) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return false;

  try {
    const response = await axios.post(
      `${BASE_URL}/record-activity-share`,
      { activityId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error recording share:', error);
    return false;
  }
};

// General WhatsApp share function
export const shareToWhatsApp = (text, url = null) => {
  const shareText = encodeURIComponent(text);
  const shareUrl = url ? encodeURIComponent(url) : '';
  
  let whatsappUrl = `https://wa.me/?text=${shareText}`;
  
  if (url) {
    whatsappUrl += ` ${shareUrl}`;
  }
  
  window.open(whatsappUrl, '_blank', 'width=600,height=400');
};

// Share Lummilo website (UNLIMITED - no restrictions)
export const shareWebsite = () => {
  const websiteUrl = window.location.origin;
  
  const text = `🌟 Ontdek Lummilo - De ultieme platform voor educatieve activiteiten! 🌟\n\n` +
    `*Wat Lummilo biedt:*\n` +
    `✅ 1000+ educatieve activiteiten\n` +
    `✅ Geschikt voor kinderen van 3-6 jaar\n` +
    `✅ Persoonlijke speelweken\n` +
    `✅ Ontwikkeld door experts\n` +
    `✅ Slechts 5-15 minuten per dag\n\n` +
    `Bezoek de website en begin vandaag nog met groeien! 🌱`;
  
  shareToWhatsApp(text, websiteUrl);
};

// Share specific activity (LIMITED to once per week)
export const shareActivity = async (activity) => {
  const baseUrl = window.location.origin;
  const activityUrl = `${baseUrl}/activity-detail/${activity.id}`;
  
  let text = `🌟 Ik deel deze geweldige activiteit van Lummilo! 🌟\n\n`;
  text += `*${activity.title}*\n`;
  text += `${activity.description.slice(0, 120)}...\n\n`;
  text += `⏱️ Duur: ${activity.time} minuten\n`;
  text += `👶 Leeftijd: ${activity.ageGroup}\n`;
  text += `🏷️ Leergebied: ${activity.learningDomain}\n\n`;
  text += `Ontdek meer leuke activiteiten op Lummilo!`;
  
  // Record this activity share via API
  await recordActivityShare(activity.id);
  shareToWhatsApp(text, activityUrl);
};

// Get user's share history via API
export const getUserShareHistory = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return [];

  try {
    const response = await axios.get(`${BASE_URL}/user-share-history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.shareHistory || [];
  } catch (error) {
    console.error('Error fetching share history:', error);
    return [];
  }
};
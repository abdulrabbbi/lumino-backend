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

// Improved WhatsApp share function for mobile compatibility
export const shareToWhatsApp = (text, url = null) => {
  const shareText = encodeURIComponent(text);
  const shareUrl = url ? encodeURIComponent(url) : '';
  
  let whatsappUrl = `https://wa.me/?text=${shareText}`;
  
  if (url) {
    whatsappUrl += `%20${shareUrl}`;
  }
  
  // Check if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile devices, use window.location which is more reliable
    window.location.href = whatsappUrl;
  } else {
    // For desktop, open in new window
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
  }
};

// Alternative method using WhatsApp API URL
export const shareToWhatsAppAlternative = (text, url = null) => {
  let fullText = text;
  if (url) {
    fullText += ` ${url}`;
  }
  
  const encodedText = encodeURIComponent(fullText);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  
  // Always use window.location for better mobile compatibility
  window.location.href = whatsappUrl;
};

// Even better: Use the Web Share API when available
export const shareWithWebShareAPI = async (text, url = null) => {
  if (navigator.share) {
    try {
      const shareData = {
        title: 'Lummilo Activiteit',
        text: text,
        url: url || window.location.href,
      };
      
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.log('Web Share API cancelled or failed:', error);
      return false;
    }
  }
  return false;
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
  
  // Try Web Share API first, then fallback to WhatsApp
  shareWithWebShareAPI(text, websiteUrl).then(success => {
    if (!success) {
      shareToWhatsAppAlternative(text, websiteUrl);
    }
  });
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
  
  // Try Web Share API first
  const webShareSuccess = await shareWithWebShareAPI(text, activityUrl);
  
  if (!webShareSuccess) {
    // Fallback to WhatsApp sharing
    shareToWhatsAppAlternative(text, activityUrl);
  }
  
  // Record this activity share via API
  await recordActivityShare(activity.id);
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
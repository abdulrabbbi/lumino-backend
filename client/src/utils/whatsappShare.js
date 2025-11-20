// Helper function to get current week number
export const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };
  
  // Check if user has already shared an activity this week
  export const hasSharedActivityThisWeek = () => {
    const lastShareData = localStorage.getItem('lastWhatsAppActivityShare');
    if (!lastShareData) return false;
    
    const { week: lastShareWeek, year: lastShareYear } = JSON.parse(lastShareData);
    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    
    return lastShareWeek === currentWeek && lastShareYear === currentYear;
  };
  
  // Save activity share record (for weekly limit)
  export const recordActivityShare = () => {
    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    
    localStorage.setItem('lastWhatsAppActivityShare', JSON.stringify({
      week: currentWeek,
      year: currentYear,
      timestamp: new Date().toISOString()
    }));
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
  export const shareActivity = (activity) => {
    const baseUrl = window.location.origin;
    const activityUrl = `${baseUrl}/activity-detail/${activity.id}`;
    
    let text = `🌟 Ik deel deze geweldige activiteit van Lummilo! 🌟\n\n`;
    text += `*${activity.title}*\n`;
    text += `${activity.description.slice(0, 120)}...\n\n`;
    text += `⏱️ Duur: ${activity.time} minuten\n`;
    text += `👶 Leeftijd: ${activity.ageGroup}\n`;
    text += `🏷️ Leergebied: ${activity.learningDomain}\n\n`;
    text += `Ontdek meer leuke activiteiten op Lummilo!`;
    
    // Record this activity share for weekly limit tracking
    recordActivityShare();
    shareToWhatsApp(text, activityUrl);
  };
  
  // Reset activity share limit (for testing)
  export const resetActivityShareLimit = () => {
    localStorage.removeItem('lastWhatsAppActivityShare');
  };
export const formatEventName = (eventName) => {
    return eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  export const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  export const getEventColor = (eventName) => {
    const colorMap = {
      login: 'bg-blue-100 text-blue-800',
      signup: 'bg-green-100 text-green-800',
      subscription_verified_success: 'bg-purple-100 text-purple-800',
      subscription_cancelled_trial: 'bg-red-100 text-red-800',
      subscription_verification_started: 'bg-yellow-100 text-yellow-800',
      subscription_checkout_started: 'bg-orange-100 text-orange-800',
      created_activity: 'bg-indigo-100 text-indigo-800',
      rated_activity: 'bg-pink-100 text-pink-800',
      activity_completed: 'bg-teal-100 text-teal-800',
      activity_started: 'bg-cyan-100 text-cyan-800'
    };
  
    return colorMap[eventName] || 'bg-gray-100 text-gray-800';
  };
  
  export const getDeviceIcon = (device) => {
    const iconMap = {
      web: '🌐',
      mobile: '📱',
      tablet: '📟'
    };
    return iconMap[device] || '💻';
  };
  
  export const generateEventDescription = (event) => {
    const { eventName, eventData, userId } = event;
    
    switch (eventName) {
      case 'login':
        return `${userId.username} logged in to their account`;
      
      case 'signup':
        return `${userId.username} created a new account`;
      
      case 'subscription_verified_success':
        return `${userId.username} successfully subscribed to "${eventData.subscriptionName}" (expires ${new Date(eventData.expiresAt).toLocaleDateString()})`;
      
      case 'subscription_cancelled_trial':
        return `${userId.username} cancelled their ${eventData.subscriptionType} subscription during trial period`;
      
      case 'subscription_verification_started':
        return `${userId.username} started payment verification for "${eventData.subscriptionName}"`;
      
      case 'subscription_checkout_started':
        return `${userId.username} started checkout for "${eventData.subscriptionName}" ($${eventData.amount})`;
      
      case 'created_activity':
        return `${userId.username} created new activity: "${eventData.activityTitle}"`;
      
      case 'rated_activity':
        return `${userId.username} rated "${eventData.activityTitle}" ${eventData.ratingValue}/10 (avg: ${eventData.averageRating}/10)`;
      
      case 'activity_completed':
        return `${userId.username} completed activity: "${eventData.activityTitle}"`;
      
      case 'activity_started':
        return `${userId.username} started activity: "${eventData.activityTitle}"`;
      
      default:
        return `${userId.username} performed ${formatEventName(eventName)}`;
    }
  };
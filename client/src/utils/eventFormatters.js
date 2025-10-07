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
import { BASE_URL } from "./api";

export const generateActivitySuggestion = async (prompt, ageGroup = '', domain = '') => {
    try {
      const response = await fetch(`${BASE_URL}/suggest-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, ageGroup, domain }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return data.suggestion;
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate activity suggestion');
    }
  };
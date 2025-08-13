/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [navigationState, setNavigationState] = useState(null);

  const saveNavigationState = (state) => {
    // Save to both context and localStorage for persistence
    setNavigationState(state);
    localStorage.setItem('activityNavigationState', JSON.stringify(state));
  };

  const getNavigationState = () => {
    // Try context first, then localStorage
    if (navigationState) {
      return navigationState;
    }
    
    const saved = localStorage.getItem('activityNavigationState');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNavigationState(parsed);
      return parsed;
    }
    
    return null;
  };

  const clearNavigationState = () => {
    setNavigationState(null);
    localStorage.removeItem('activityNavigationState');
  };

  return (
    <NavigationContext.Provider value={{
      saveNavigationState,
      getNavigationState,
      clearNavigationState
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

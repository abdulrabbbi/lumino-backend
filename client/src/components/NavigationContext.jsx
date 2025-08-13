/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  const saveNavigationState = (state) => {
    // Save to both context and localStorage
    context.saveNavigationState(state);
    localStorage.setItem('activityNavigationState', JSON.stringify({
      ...state,
      _persisted: true // Add marker that this was persisted
    }));
  };

  const getNavigationState = () => {
    // First try context
    const ctxState = context.getNavigationState();
    if (ctxState) return ctxState;
    
    // Then try localStorage
    const saved = localStorage.getItem('activityNavigationState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed._persisted) {
          context.saveNavigationState(parsed);
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse navigation state', e);
      }
    }
    
    return null;
  };

  return {
    ...context,
    saveNavigationState,
    getNavigationState
  };
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

"use client"

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react"

const NavigationContext = createContext()

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }

  const saveNavigationState = useCallback(
    (state) => {
      const stateWithTimestamp = {
        ...state,
        timestamp: Date.now(),
        _persisted: true,
      }

      // Save to both context and localStorage
      context.saveNavigationState(stateWithTimestamp)
      localStorage.setItem("activityNavigationState", JSON.stringify(stateWithTimestamp))
      sessionStorage.setItem("activityNavigationState", JSON.stringify(stateWithTimestamp))

      console.log("[Navigation] Saved state:", stateWithTimestamp)
    },
    [context],
  )

  const getNavigationState = useCallback(() => {
    // First try context
    const ctxState = context.getNavigationState()
    if (ctxState && ctxState.timestamp && Date.now() - ctxState.timestamp < 300000) {
      // 5 minutes
      return ctxState
    }

    // Then try sessionStorage (preferred for tab-specific data)
    const sessionSaved = sessionStorage.getItem("activityNavigationState")
    if (sessionSaved) {
      try {
        const parsed = JSON.parse(sessionSaved)
        if (parsed._persisted && parsed.timestamp && Date.now() - parsed.timestamp < 300000) {
          context.saveNavigationState(parsed)
          console.log("[Navigation] Restored from session:", parsed)
          return parsed
        }
      } catch (e) {
        console.error("Failed to parse session navigation state", e)
      }
    }

    // Finally try localStorage
    const localSaved = localStorage.getItem("activityNavigationState")
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved)
        if (parsed._persisted && parsed.timestamp && Date.now() - parsed.timestamp < 300000) {
          context.saveNavigationState(parsed)
          console.log("[Navigation] Restored from local:", parsed)
          return parsed
        }
      } catch (e) {
        console.error("Failed to parse local navigation state", e)
      }
    }

    return null
  }, [context])

  const clearNavigationState = useCallback(() => {
    context.clearNavigationState()
    localStorage.removeItem("activityNavigationState")
    sessionStorage.removeItem("activityNavigationState")
    console.log("[Navigation] Cleared state")
  }, [context])

  return {
    ...context,
    saveNavigationState,
    getNavigationState,
    clearNavigationState,
  }
}

export const NavigationProvider = ({ children }) => {
  const [navigationState, setNavigationState] = useState(null)

  const saveNavigationState = useCallback((state) => {
    setNavigationState(state)
    localStorage.setItem("activityNavigationState", JSON.stringify(state))
    sessionStorage.setItem("activityNavigationState", JSON.stringify(state))
  }, [])

  const getNavigationState = useCallback(() => {
    if (navigationState) {
      return navigationState
    }

    // Try sessionStorage first
    const sessionSaved = sessionStorage.getItem("activityNavigationState")
    if (sessionSaved) {
      try {
        const parsed = JSON.parse(sessionSaved)
        setNavigationState(parsed)
        return parsed
      } catch (e) {
        console.error("Failed to parse session state", e)
      }
    }

    // Then localStorage
    const localSaved = localStorage.getItem("activityNavigationState")
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved)
        setNavigationState(parsed)
        return parsed
      } catch (e) {
        console.error("Failed to parse local state", e)
      }
    }

    return null
  }, [navigationState])

  const clearNavigationState = useCallback(() => {
    setNavigationState(null)
    localStorage.removeItem("activityNavigationState")
    sessionStorage.removeItem("activityNavigationState")
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        saveNavigationState,
        getNavigationState,
        clearNavigationState,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

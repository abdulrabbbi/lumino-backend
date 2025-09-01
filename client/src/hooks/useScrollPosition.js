"use client"

// hooks/useScrollPosition.js
import { useEffect, useRef, useCallback } from "react"

export const useScrollPosition = (key) => {
  const scrollPositionRef = useRef(0)
  const isRestoringRef = useRef(false)

  const saveScrollPosition = useCallback(() => {
    const currentPosition = window.scrollY
    scrollPositionRef.current = currentPosition

    if (key) {
      // Save to both sessionStorage and localStorage for better persistence
      sessionStorage.setItem(`scroll_${key}`, currentPosition.toString())
      localStorage.setItem(`scroll_${key}`, currentPosition.toString())
    }

    console.log(`[Scroll] Saved position: ${currentPosition} for key: ${key}`)
  }, [key])

  const restoreScrollPosition = useCallback(() => {
    if (isRestoringRef.current) return

    const getPosition = () => {
      if (key) {
        // Try sessionStorage first, then localStorage
        const sessionSaved = sessionStorage.getItem(`scroll_${key}`)
        const localSaved = localStorage.getItem(`scroll_${key}`)
        const saved = sessionSaved || localSaved

        if (saved) {
          const position = Number.parseInt(saved, 10)
          console.log(`[Scroll] Found saved position: ${position} for key: ${key}`)
          return position
        }
      }
      return scrollPositionRef.current
    }

    const position = getPosition()
    if (position > 0) {
      isRestoringRef.current = true

      // Multiple restoration attempts for better reliability
      const restoreAttempts = [100, 300, 500, 1000]

      restoreAttempts.forEach((delay, index) => {
        setTimeout(() => {
          const currentScroll = window.scrollY
          if (Math.abs(currentScroll - position) > 50) {
            // Only scroll if significantly different
            window.scrollTo({
              top: position,
              behavior: index === 0 ? "instant" : "smooth",
            })
            console.log(`[Scroll] Restored to position: ${position} (attempt ${index + 1})`)
          }

          if (index === restoreAttempts.length - 1) {
            isRestoringRef.current = false
          }
        }, delay)
      })
    }
  }, [key])

  const clearScrollPosition = useCallback(() => {
    scrollPositionRef.current = 0
    if (key) {
      sessionStorage.removeItem(`scroll_${key}`)
      localStorage.removeItem(`scroll_${key}`)
    }
  }, [key])

  useEffect(() => {
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        scrollPositionRef.current = window.scrollY
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    currentPosition: scrollPositionRef.current,
  }
}

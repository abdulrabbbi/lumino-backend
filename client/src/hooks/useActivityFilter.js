"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { BASE_URL } from "../utils/api"
import { toast } from "react-toastify"

export const useActivitiesFilter = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("") // This updates on every keystroke
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState("") // This triggers the API call
  const [selectedCategory, setSelectedCategory] = useState("Alle Leergebieden")
  const [selectedAge, setSelectedAge] = useState("alle-leeftijden")
  const [selectedSort, setSelectedSort] = useState("hoogstgewaardeerde")

  const fetchFilteredActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const authToken = localStorage.getItem("authToken")
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}

      const response = await axios.get(`${BASE_URL}/filter-activities`, {
        params: {
          searchTerm: effectiveSearchTerm, // Use effectiveSearchTerm for API call
          category: selectedCategory,
          age: selectedAge,
          sort: selectedSort,
        },
        headers,
      })
      setActivities(response.data.activities)
    } catch (err) {
      console.error("Error fetching filtered activities:", err)
      const errorMessage = err.response?.data?.message || "Failed to fetch activities."
      setError(errorMessage)
      setActivities([])
      if (errorMessage === "Login required to view completed activities.") {
        toast.info(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [effectiveSearchTerm, selectedCategory, selectedAge, selectedSort]) // Dependencies for useCallback

  useEffect(() => {
    // Only trigger fetch when non-search filters change, not on every effectiveSearchTerm change
    fetchFilteredActivities()
  }, [selectedCategory, selectedAge, selectedSort]) // Removed effectiveSearchTerm from dependencies

  useEffect(() => {
    // This will trigger when effectiveSearchTerm changes (via triggerSearch)
    if (
      effectiveSearchTerm !== "" ||
      selectedCategory !== "Alle Leergebieden" ||
      selectedAge !== "alle-leeftijden" ||
      selectedSort !== "hoogstgewaardeerde"
    ) {
      fetchFilteredActivities()
    }
  }, [effectiveSearchTerm, fetchFilteredActivities])

  // Function to explicitly trigger the search API call
  const triggerSearch = useCallback(() => {
    setEffectiveSearchTerm(searchTerm) // Update effectiveSearchTerm to trigger fetch
  }, [searchTerm])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setEffectiveSearchTerm("") // Reset effective search term too
    setSelectedCategory("Alle Leergebieden")
    setSelectedAge("alle-leeftijden")
    setSelectedSort("hoogstgewaardeerde")
  }, [])

  return {
    activities,
    loading,
    error,
    searchTerm, // Return searchTerm for input value
    selectedCategory,
    selectedAge,
    selectedSort,
    setSearchTerm,
    setSelectedCategory,
    setSelectedAge,
    setSelectedSort,
    resetFilters,
    triggerSearch, // Expose the triggerSearch function
  }
}

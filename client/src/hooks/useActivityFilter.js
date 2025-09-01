"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { BASE_URL } from "../utils/api"
import { toast } from "react-toastify"

export const useActivitiesFilter = (
  initialSearchTerm = "",
  initialCategory = "Alle Leergebieden",
  initialAge = "alle-leeftijden",
  initialSort = "hoogstgewaardeerde",
) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState(initialSearchTerm)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedAge, setSelectedAge] = useState(initialAge)
  const [selectedSort, setSelectedSort] = useState(initialSort)

  const fetchFilteredActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const authToken = localStorage.getItem("authToken")
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}

      const response = await axios.get(`${BASE_URL}/filter-activities`, {
        params: {
          searchTerm: effectiveSearchTerm,
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
  }, [effectiveSearchTerm, selectedCategory, selectedAge, selectedSort])

  useEffect(() => {
    fetchFilteredActivities()
  }, [selectedCategory, selectedAge, selectedSort, fetchFilteredActivities])

  useEffect(() => {
    if (
      effectiveSearchTerm !== "" ||
      selectedCategory !== "Alle Leergebieden" ||
      selectedAge !== "alle-leeftijden" ||
      selectedSort !== "hoogstgewaardeerde"
    ) {
      fetchFilteredActivities()
    }
  }, [effectiveSearchTerm, fetchFilteredActivities])

  const triggerSearch = useCallback(() => {
    setEffectiveSearchTerm(searchTerm)
  }, [searchTerm])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setEffectiveSearchTerm("")
    setSelectedCategory("Alle Leergebieden")
    setSelectedAge("alle-leeftijden")
    setSelectedSort("hoogstgewaardeerde")
  }, [])

  return {
    activities,
    loading,
    error,
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    setSearchTerm,
    setSelectedCategory,
    setSelectedAge,
    setSelectedSort,
    resetFilters,
    triggerSearch,
  }
}

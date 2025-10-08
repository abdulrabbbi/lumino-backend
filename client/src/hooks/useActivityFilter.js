import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { BASE_URL } from "../utils/api"
import { toast } from "react-toastify"

export const useActivitiesFilter = (
  initialSearchTerm = "",
  initialCategory = "Alle Leergebieden",
  initialAge = "alle-leeftijden",
  initialSort = "hoogstgewaardeerde",
  initialPage = 1,
  initialStatus = "all",
) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState(initialSearchTerm)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedAge, setSelectedAge] = useState(initialAge)
  const [selectedSort, setSelectedSort] = useState(initialSort)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus) // New status state

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(30)

  const fetchFilteredActivities = useCallback(
    async (page = currentPage) => {
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
            status: selectedStatus, // Send status separately
            page: page,
            limit: limit,
          },
          headers,
        })

        setActivities(response.data.activities)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.currentPage)
        setTotalCount(response.data.totalCount)
      } catch (err) {
        console.error("Error fetching filtered activities:", err)
        const errorMessage = err.response?.data?.message || "Failed to fetch activities."
        setError(errorMessage)
        setActivities([])
        setTotalPages(0)
        setTotalCount(0)
        if (errorMessage === "Login required to view completed activities.") {
          toast.info(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    },
    [effectiveSearchTerm, selectedCategory, selectedAge, selectedSort, selectedStatus, currentPage, limit], // Include selectedStatus
  )

  useEffect(() => {
    fetchFilteredActivities()
  }, [selectedCategory, selectedAge, selectedSort, selectedStatus, fetchFilteredActivities]) // Include selectedStatus

  useEffect(() => {
    if (
      effectiveSearchTerm !== "" ||
      selectedCategory !== "Alle Leergebieden" ||
      selectedAge !== "alle-leeftijden" ||
      selectedSort !== "hoogstgewaardeerde" ||
      selectedStatus !== "all" // Include status in change checks
    ) {
      fetchFilteredActivities()
    }
  }, [effectiveSearchTerm, fetchFilteredActivities, selectedStatus]) // Include selectedStatus

  const triggerSearch = useCallback(() => {
    setEffectiveSearchTerm(searchTerm)
    setCurrentPage(1)
  }, [searchTerm])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setEffectiveSearchTerm("")
    setSelectedCategory("Alle Leergebieden")
    setSelectedAge("alle-leeftijden")
    setSelectedSort("hoogstgewaardeerde")
    setSelectedStatus("all") // Reset status
    setCurrentPage(1)
  }, [])

  const changePage = useCallback(
    (page) => {
      setCurrentPage(page)
      fetchFilteredActivities(page)
    },
    [fetchFilteredActivities],
  )

  const setSelectedCategoryWithReset = useCallback((category) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }, [])

  const setSelectedAgeWithReset = useCallback((age) => {
    setSelectedAge(age)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }, [])

  const setSelectedSortWithReset = useCallback((sort) => {
    setSelectedSort(sort)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }, [])

  const setSelectedStatusWithReset = useCallback((status) => {
    setSelectedStatus(status)
    setCurrentPage(1) // Reset to page 1 when status changes
  }, [])

  return {
    activities,
    loading,
    error,
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    selectedStatus, // Expose status
    currentPage,
    totalPages,
    totalCount,
    setSearchTerm,
    setSelectedCategory: setSelectedCategoryWithReset,
    setSelectedAge: setSelectedAgeWithReset,
    setSelectedSort: setSelectedSortWithReset,
    setSelectedStatus: setSelectedStatusWithReset, // Expose setter
    resetFilters,
    triggerSearch,
    changePage,
  }
}

"use client"

/* eslint-disable no-unused-vars */
import { Plus } from "lucide-react"
import Specs from "../components/specs"
import Faqs from "../components/faqs"
import { Clock, Star } from "lucide-react"
import { IoPlayCircleOutline } from "react-icons/io5"
import { FiUsers } from "react-icons/fi"
import { useEffect, useState, useRef } from "react"
import EducationalQuotes from "../components/educational-quotes"
import StarImage from "../../public/profile-images/Frame (11)-star.svg"
import { toast } from "react-toastify"
import { useActivitiesFilter } from "../hooks/useActivityFilter"
import { usePlayweekActivities } from "../hooks/usePlayweekActivities"
import { learningDomainImages, learningDomainColors } from "../utils/learningDomain"
import EmailCollectionPopup from "../components/EmailCollectionPopup"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import LoaderOverlay from "../components/LoaderOverlay"
import { BASE_URL } from "../utils/api"
import axios from "axios"
import { useNavigation } from "../components/NavigationContext"
import { useScrollPosition } from "../hooks/useScrollPosition"
import ParentCoachBot from "../components/parenst-coach-bot"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"

export default function Activities() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { saveNavigationState, getNavigationState, clearNavigationState } = useNavigation()
  const { saveScrollPosition, restoreScrollPosition, clearScrollPosition } = useScrollPosition("activities")

  const [activeTab, setActiveTab] = useState("speelweek")
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const [isRestoringFromActivity, setIsRestoringFromActivity] = useState(false)
  const [totalCountActivities, settotalCountActivities] = useState(0)

  const [favorites, setFavorites] = useState({})

  const [favoriteLoading, setFavoriteLoading] = useState({}) // { [activityId]: boolean }

  const activityListRef = useRef(null)

  const getInitialFilters = () => {
    if (location.state?.fromActivity) {
      const savedState = getNavigationState()
      if (savedState && savedState.filters) {
        console.log("[Activities] Restoring saved state for back navigation:", savedState)
        return {
          searchTerm: savedState.filters.searchTerm || "",
          category: savedState.filters.selectedCategory || "Alle Leergebieden",
          age: savedState.filters.selectedAge || "alle-leeftijden",
          sort: savedState.filters.selectedSort || "hoogstgewaardeerde",
          status: savedState.filters.selectedStatus || "all", // restore status
          page: savedState.currentPage || 1,
        }
      }
    }

    // Otherwise use URL params
    return {
      searchTerm: searchParams.get("search") || "",
      category: searchParams.get("category") || "Alle Leergebieden",
      age: searchParams.get("age") || "alle-leeftijden",
      sort: searchParams.get("sort") || "hoogstgewaardeerde",
      status: searchParams.get("status") || "all", // read status from URL
      page: Number.parseInt(searchParams.get("page")) || 1,
    }
  }

  const initialFilters = getInitialFilters()

  const {
    activities: filteredActivities,
    loading: filterLoading,
    error: filterError,
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    selectedStatus, // new status from hook
    currentPage,
    totalPages,
    totalCount,
    setSearchTerm,
    setSelectedCategory,
    setSelectedAge,
    setSelectedSort,
    setSelectedStatus, // new setter
    resetFilters,
    triggerSearch,
    changePage,
  } = useActivitiesFilter(
    initialFilters.searchTerm,
    initialFilters.category,
    initialFilters.age,
    initialFilters.sort,
    initialFilters.page,
    initialFilters.status, // pass initial status
  )

  const { playweekActivities, weekInfo, loading: playweekLoading, error: playweekError } = usePlayweekActivities()

  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (location.state?.fromActivity) {
      console.log("[Activities] Detected return from activity detail")
      const savedState = getNavigationState()

      if (savedState) {
        console.log("[Activities] Restoring saved state:", savedState)
        setIsRestoringFromActivity(true)

        // Restore tab state
        setActiveTab(savedState.activeTab || "speelweek")

        // Mark that we've restored state
        setHasRestoredState(true)

        // Wait for the next tick to ensure DOM is updated, then restore scroll
        setTimeout(() => {
          restoreScrollPosition()
          setIsRestoringFromActivity(false)
          clearNavigationState() // Clear after restoration
        }, 300)
      }
    } else {
      setHasRestoredState(true)
    }
  }, [location.state])

  useEffect(() => {
    if (activeTab === "library" && hasRestoredState && !isRestoringFromActivity) {
      const params = new URLSearchParams()

      if (searchTerm) params.set("search", searchTerm)
      if (selectedCategory !== "Alle Leergebieden") params.set("category", selectedCategory)
      if (selectedAge !== "alle-leeftijden") params.set("age", selectedAge)
      if (selectedSort !== "hoogstgewaardeerde") params.set("sort", selectedSort)
      if (selectedStatus !== "all") params.set("status", selectedStatus) // include status
      if (currentPage > 1) params.set("page", currentPage.toString())

      // Replace the current URL with updated params
      setSearchParams(params, { replace: true })
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    selectedStatus, // dependency
    currentPage,
    activeTab,
    hasRestoredState,
    isRestoringFromActivity,
    setSearchParams,
  ])

  useEffect(() => {
    if (activeTab === "library" && hasRestoredState && !isRestoringFromActivity) {
      const params = new URLSearchParams()

      if (searchTerm) params.set("search", searchTerm)
      if (selectedCategory !== "Alle Leergebieden") params.set("category", selectedCategory)
      if (selectedAge !== "alle-leeftijden") params.set("age", selectedAge)
      if (selectedSort !== "hoogstgewaardeerde") params.set("sort", selectedSort)
      if (selectedStatus !== "all") params.set("status", selectedStatus) // include status
      if (currentPage > 1) params.set("page", currentPage.toString())

      // Replace the current URL with updated params
      setSearchParams(params, { replace: true })
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    selectedStatus, // dependency
    currentPage,
    activeTab,
    hasRestoredState,
    isRestoringFromActivity,
    setSearchParams,
  ])

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      setIsGuest(true)
      const timer = setTimeout(() => {
        const hasClosedPopup = localStorage.getItem("closedEmailPopup")
        if (!hasClosedPopup) {
          setShowEmailPopup(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const fetchTotalCountActivites = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get-total-activities-count`)
        settotalCountActivities(res.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchTotalCountActivites()
  }, [])

  useEffect(() => {
    const fetchUserFavorites = async () => {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) return

      try {
        const response = await axios.get(`${BASE_URL}/get-user-favorite-activities`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (response.data.success) {
          const favoritesMap = {}
          response.data.favorites.forEach((fav) => {
            favoritesMap[fav.activityId] = true
          })
          setFavorites(favoritesMap)
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
      }
    }

    fetchUserFavorites()
  }, [])

  const handleSubmitEmail = async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/collect-email-for-guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        throw new Error("Failed to submit email")
      }
      localStorage.setItem("submittedGuestEmail", email)
    } catch (error) {
      console.error("Error submitting email:", error)
      throw error
    }
  }

  const handleClosePopup = () => {
    setShowEmailPopup(false)
    localStorage.setItem("closedEmailPopup", "true")
  }

  const getCurrentActivities = () => {
    if (activeTab === "speelweek") {
      return playweekActivities.map((activity) => {
        const domain = (activity.learningDomain || "").trim()
        return {
          id: activity._id,
          title: activity.title,
          description: activity.description,
          image: learningDomainImages[domain] || "/placeholder.svg",
          progress: `${activity.time} min`,
          ageRange: activity.ageGroup,
          rating: activity.averageRating?.toFixed(1) || "0.0",
          reviews: `${activity.ratings?.length || 0} reviews`,
          tag: domain,
          tagColor: learningDomainColors[domain] || "bg-gray-500 text-white",
          isLocked: activity.isLocked,
          isCompleted: activity.isCompleted,
          isCompletedInCurrentWeek: activity.isCompletedInCurrentWeek,
          learningDomain: domain,
        }
      })
    }

    return filteredActivities.map((activity) => {
      const domain = (activity.learningDomain || "").trim()
      return {
        id: activity._id,
        title: activity.title,
        description: activity.description,
        image: learningDomainImages[domain] || "/placeholder.svg",
        progress: `${activity.time} min`,
        ageRange: activity.ageGroup,
        rating: activity.averageRating?.toFixed(1),
        reviews: `${activity.ratings?.length || 0} reviews`,
        tag: domain,
        tagColor: learningDomainColors[domain],
        isLocked: activity.isLocked,
        isCompleted: activity.isCompleted,
        learningDomain: domain,
      }
    })
  }

  const handleStartActivityClick = () => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      toast.info("Je moet eerst inloggen om een activiteit aan te maken.")
      return
    }
    navigate("/create-activity")
  }

  const handleActivityClick = (activity) => {
    const userLoggedIn = localStorage.getItem("authToken")

    // Guest user (not logged in)
    if (!userLoggedIn) {
      if (activity.isLocked) {
        navigate("/signup")
        return
      } else {
        saveScrollPosition()
        saveNavigationState({
          activeTab,
          currentPage, // Save current page for Scenario 1
          filters:
            activeTab === "library"
              ? {
                  searchTerm,
                  selectedCategory,
                  selectedAge,
                  selectedSort,
                  selectedStatus, // save status
                }
              : null,
        })
        navigate(`/activity-detail/${activity.id}`, {
          state: { fromActivities: true },
        })
        return
      }
    }

    // Logged-in user
    if (activity.isLocked) {
      navigate("/pricing")
      return
    }

    saveScrollPosition()
    saveNavigationState({
      activeTab,
      currentPage, // Save current page for Scenario 1
      filters:
        activeTab === "library"
          ? {
              searchTerm,
              selectedCategory,
              selectedAge,
              selectedSort,
              selectedStatus, // save status
            }
          : null,
    })
    navigate(`/activity-detail/${activity.id}`, {
      state: { fromActivities: true },
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchClick = () => {
    console.log("[Activities] Search triggered - resetting to page 1")
    triggerSearch() // This will reset to page 1 due to Scenario 2
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearchClick()
    }
  }

  const handleCategoryChange = (e) => {
    console.log("[Activities] Category filter changed - resetting to page 1")
    setSelectedCategory(e.target.value) // This will reset to page 1 due to enhanced setter
  }

  const handleAgeChange = (e) => {
    console.log("[Activities] Age filter changed - resetting to page 1")
    setSelectedAge(e.target.value) // This will reset to page 1 due to enhanced setter
  }

  const handleSortChange = (e) => {
    console.log("[Activities] Sort filter changed - resetting to page 1")
    setSelectedSort(e.target.value) // This will reset to page 1 due to enhanced setter
  }

  const handleStatusChange = (e) => {
    console.log("[Activities] Status filter changed - resetting to page 1")
    setSelectedStatus(e.target.value) // update status
  }

  useEffect(() => {
    if (location.state?.fromActivity) {
      const timer = setTimeout(() => {
        restoreScrollPosition()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [location.state, restoreScrollPosition])

  const getPaginationRange = (currentPage, totalPages) => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("...")
        pageNumbers.push(currentPage - 1)
        pageNumbers.push(currentPage)
        pageNumbers.push(currentPage + 1)
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers
  }

  const handlePageChange = (page) => {
    console.log(`[Activities] Changing to page ${page}`)
    changePage(page)
    // Smooth scroll to activity list without jarring movement
    if (activityListRef.current) {
      const headerOffset = 100
      const elementPosition = activityListRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const renderPagination = () => {
    if (activeTab !== "library") {
      return null
    }

    const pageNumbers = getPaginationRange(currentPage, totalPages)

    return (
      <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 px-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-700 inter-tight-400 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] sm:min-w-[80px]"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 max-w-full overflow-x-auto">
          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span key={index} className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm inter-tight-400 cursor-pointer min-w-[32px] sm:min-w-[40px] ${
                  currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 sm:px-4 py-2 rounded-lg bg-gray-200 inter-tight-400 text-xs sm:text-sm cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] sm:min-w-[80px]"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      </div>
    )
  }

  const toggleFavorite = async (activityId) => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      toast.info("Je moet inloggen om activiteiten als favoriet te markeren")
      return
    }

    // Prevent duplicate requests for the same item
    if (favoriteLoading[activityId]) return

    // Optimistic update
    const wasFavorite = !!favorites[activityId]
    setFavorites((prev) => ({ ...prev, [activityId]: !wasFavorite }))
    setFavoriteLoading((prev) => ({ ...prev, [activityId]: true }))

    try {
      const response = await axios.post(
        `${BASE_URL}/toggle-favourite-activity`,
        { activityId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (response.data?.success) {
        // Ensure UI matches backend response
        setFavorites((prev) => ({ ...prev, [activityId]: !!response.data.isFavorite }))
        if (response.data?.message) {
          toast.success(response.data.message)
        }
      } else {
        // Rollback on unexpected response
        setFavorites((prev) => ({ ...prev, [activityId]: wasFavorite }))
        toast.error("Fout bij bijwerken favorieten")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      // Rollback on error
      setFavorites((prev) => ({ ...prev, [activityId]: wasFavorite }))
      toast.error("Fout bij bijwerken favorieten")
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [activityId]: false }))
    }
  }

  return (
    <>
      {/* <ToastContainer style={{ zIndex: 1000000000 }} /> */}
      {isGuest && showEmailPopup && <EmailCollectionPopup onClose={handleClosePopup} onSubmit={handleSubmitEmail} />}
      <div className="h-full flex flex-col items-center justify-center lg:px-4 lg:py-8 p-4">
        <div className="md:w-[90%] mx-auto w-full  text-center space-y-8">
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-open w-8 h-8 text-white animate-pulse"
              >
                <path d="M12 7v14"></path>
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="lg:leading-tighter pb-7 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] inter-tight-700  bg-clip-text text-transparent  bg-gradient-to-b to-[#9333EA] from-[#DB2777]">
              Samen groeien met elke activiteit
            </h1>
            <p className="text-sm text-[#4B5563] inter-tight-400 font-medium">
              Bouw mee aan het onderwijs van de toekomst
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="bg-[#F8F8FF] rounded-2xl py-2 border border-[#CDCDCD]">
              <div className="flex items-center inter-tight-400 justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] mr-2"></div>
                <span className="text-md font-medium text-[#5D5D5D]">
                  {totalCountActivities}+ Activiteiten Beschikbaar
                </span>
              </div>
            </div>
            <div className="bg-[#F8F8FF] rounded-2xl py-2 border border-[#CDCDCD]">
              <div className="flex items-center inter-tight-400 justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#3FDBB1] mr-2"></div>
                <span className="text-md font-medium text-[#5D5D5D]">5-15 Minuten Per Dag</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-center mb-8 ">
            <div className="flex flex-col  mt-10 sm:flex-row  gap-2 justify-center items-center">
              <div className="flex  gap-2 justify-center items-center bg-gradient-to-tr from-[#F3F4F6] to-[#E5E7EB] p-1 rounded-lg">
                <button
                  onClick={() => handleTabChange("speelweek")}
                  className={`md:w-[575px] w-[160px] py-2 flex justify-center items-center gap-2 cursor-pointer rounded-lg text-sm transition-colors ${
                    activeTab === "speelweek" ? "bg-[#8F34EA] text-white rounded-lg" : "text-[#616161]  rounded-lg"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-gamepad2 h-4 w-4"
                  >
                    <line x1="6" x2="10" y1="11" y2="11"></line>
                    <line x1="8" x2="8" y1="9" y2="13"></line>
                    <line x1="15" x2="15.01" y1="12" y2="12"></line>
                    <line x1="18" x2="18.01" y1="10" y2="10"></line>
                    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                  </svg>
                  <span className="inline">Speelweek</span>
                </button>
                <button
                  onClick={() => handleTabChange("library")}
                  className={`md:w-[575px] w-[160px] py-2 flex justify-center items-center gap-2 cursor-pointer rounded-lg text-sm transition-colors ${
                    activeTab === "library" ? "bg-[#8F34EA] text-white rounded-lg" : "text-[#616161] rounded-lg"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="hidden md:inline h-4 w-4"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 7v14"></path>
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  </svg>
                  <span className="inline">Activiteitenbibliotheek</span>
                </button>
              </div>
              <button
                onClick={handleStartActivityClick}
                className="justify-center md:w-auto w-full cursor-pointer text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap "
              >
                <Plus size={16} />
                Activiteit Toevoegen
              </button>
            </div>
          </div>
        </div>
        {activeTab === "library" && (
          <div className="bg-gradient-to-br md:w-[90%] mx-auto w-full rounded-xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] md:p-6 p-3 mb-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Zoek Activiteiten"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-4 py-2 border-none outline-none text-sm bg-[#FFFFFF] rounded-xl inter-tight-400 "
                />
                <button
                  onClick={handleSearchClick}
                  className="absolute inset-y-0 left-0 bottom-0 pl-3 flex items-center cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="Search activities"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
              >
                <option value="Alle Leergebieden">Alle Leergebieden</option>
                <option value="Emotionele Gezondheid">Emotionele Gezondheid</option>
                <option value="Veerkracht">Veerkracht</option>
                <option value="Dankbaarheid">Dankbaarheid</option>
                <option value="Zelfzorg">Zelfzorg</option>
                <option value="Geldwijsheid">Geldwijsheid</option>
                <option value="Ondernemerschap">Ondernemerschap</option>
                <option value="Anders denken">Anders denken</option>
              </select>
              <select
                value={selectedAge}
                onChange={handleAgeChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
              >
                <option value="alle-leeftijden">Alle Leeftijden</option>
                <option value="3-4">3-4 jaar</option>
                <option value="3-6">3-6 jaar</option>
                <option value="5-6">5-6 jaar</option>
              </select>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
              >
                <option value="all">Alle Statussen</option>
                <option value="voltooid">Voltooid</option>
                <option value="niet-voltooid">Niet voltooid</option>
                <option value="favoriet">Favorieten</option>
              </select>
              <select
                value={selectedSort}
                onChange={handleSortChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
              >
                <option value="hoogstgewaardeerde">Hoogst gewaardeerde</option>
                <option value="meestgewaardeerde">Meest gewaardeerde</option>
              </select>
            </div>
          </div>
        )}
        <div className="md:w-[90%] mx-auto" ref={activityListRef}>
          <div className="h-auto relative bg-gradient-to-br rounded-3xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] mt-5 p-4 md:p-8">
            <img
              src={StarImage || "/placeholder.svg"}
              alt="Top left decoration"
              className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 w-16 sm:w-20 lg:w-24 h-auto z-10"
            />
            <div className=" w-full m-auto">
              {activeTab === "speelweek" && (
                <div className="flex justify-center items-center flex-col">
                  <h1 className="text-2xl md:text-3xl text-[#000000] poppins-700 py-5">
                    Deze Week: Week {weekInfo?.weekNumber}
                  </h1>
                  <p className="text-[#4B5563] text-center text-sm mb-6">
                    5 zorgvuldig geselecteerde activiteiten om samen te ontdekken
                  </p>
                </div>
              )}
              {(playweekLoading || filterLoading) && <LoaderOverlay />}
              {activeTab === "library" && filterError === "Login required to view completed activities." ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-[#666666] inter-tight-400 text-[16px] text-center">
                    <p>Geen activiteiten gevonden met de huidige filters.</p>
                  </div>
                </div>
              ) : (
                (playweekError || filterError) && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-red-500 text-center">
                      <p>Fout bij het laden van activiteiten:</p>
                      <p className="text-sm">{playweekError || filterError}</p>
                    </div>
                  </div>
                )
              )}
              {!playweekLoading &&
                !playweekError &&
                activeTab === "speelweek" &&
                getCurrentActivities().length === 0 && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-[#666666] inter-tight-400 text-[16px] text-center">
                      <p>Geen speelweek activiteiten gevonden.</p>
                    </div>
                  </div>
                )}
              {!filterLoading && !filterError && activeTab === "library" && filteredActivities.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-[#666666] inter-tight-400 text-[16px] text-center">
                    <p>Geen activiteiten gevonden met de huidige filters.</p>
                  </div>
                </div>
              )}
              {!playweekLoading && !filterLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentActivities().map((activity) => (
                    <div
                      onClick={() => handleActivityClick(activity)}
                      key={activity.id}
                      className="relative group pt-5 pb-2 p-[1px] cursor-pointer"
                    >
                      <div className="absolute top-10 right-6 z-20">
                        <span
                          className={`px-4 py-1 text-xs font-bold rounded-md shadow-md ${
                            activity.isLocked ? "bg-red-600 text-white" : "bg-yellow-500 text-white"
                          }`}
                        >
                          {activity.isLocked ? "LOCKED" : "FREE"}
                        </span>
                      </div>
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#DB297A] to-[#7940EA] z-0 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                      <div
                        className={`relative z-10 md:h-[580px] h-auto bg-white rounded-2xl overflow-hidden transition-shadow duration-300 ease-in-out group-hover:shadow-lg flex flex-col ${
                          activity.isLocked ? "opacity-80" : ""
                        }`}
                      >
                        <div className="p-3">
                          <div className="bg-[#F3F4F6] rounded-2xl h-48 flex items-center justify-center">
                            <div className="h-18 w-18 shadow-3xl bg-[#f1e7e7] rounded-full flex items-center justify-center mx-auto mb-4">
                              <img src={activity.image || "/placeholder.svg"} className="h-10 w-10" alt="" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex-1">
                            <div>
                              <div className="w-full flex justify-between items-center">
                                <h3 className="text-lg text-[#0F2137] poppins-700 mb-1">{activity.title}</h3>

                                <div>
                                  <div className="relative group">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (activity.isLocked || !localStorage.getItem("authToken")) return
                                        toggleFavorite(activity.id)
                                      }}
                                      disabled={!!favoriteLoading[activity.id] || activity.isLocked}
                                      className={`p-2 rounded-full cursor-pointer transition-colors ${
                                        activity.isLocked ? "opacity-40 cursor-not-allowed" : ""
                                      }`}
                                      aria-pressed={!!favorites[activity.id]}
                                      aria-label={
                                        activity.isLocked
                                          ? "Ontgrendel activiteit om als favoriet te markeren"
                                          : favorites[activity.id]
                                            ? "Verwijder uit favorieten"
                                            : "Voeg toe aan favorieten"
                                      }
                                    >
                                      {favorites[activity.id] && !activity.isLocked ? (
                                        <AiFillHeart
                                          size={25}
                                          color="#ef4444"
                                          className={`transition-colors ${
                                            favoriteLoading[activity.id] ? "opacity-70" : ""
                                          }`}
                                        />
                                      ) : (
                                        <AiOutlineHeart
                                          size={25}
                                          color={
                                            activity.isLocked
                                              ? "#9ca3af"
                                              : favorites[activity.id]
                                                ? "#ef4444"
                                                : "#6b7280"
                                          }
                                          className={`transition-colors ${
                                            favoriteLoading[activity.id] ? "opacity-70" : ""
                                          }`}
                                        />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[#666666] space-grotesk-400 text-[16px] leading-relaxed">
                                {activity.description.slice(0, 120)}...
                              </p>
                            </div>
                            <div className="flex items-center inter-tight-400 justify-between text-sm mt-8 text-[#838383]">
                              <div className="flex items-center gap-1 sora-400">
                                <Clock className="w-4 h-4" />
                                <span>{activity.progress}</span>
                              </div>
                              <div className="flex items-center gap-1 sora-400">
                                <FiUsers className="w-4 h-4" />
                                <span>{activity.ageRange}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            {activity.isCompleted ? (
                              <>
                                <div className="rounded-lg bg-[#FFFCE6] border border-yellow-200 p-3 flex items-center justify-center gap-2">
                                  <Star className="w-4 h-4 text-[#FACC15] fill-current" />
                                  <span className="text-sm inter-tight-400 font-medium text-gray-700">
                                    <span className="font-bold text-black inter-tight-700">{activity.rating}</span> (
                                    {activity.reviews})
                                  </span>
                                </div>

                                {/* Smaller completed section */}
                                <div className="bg-[#FEFCE8] flex flex-col justify-center items-center p-5 rounded-2xl mt-3">
                                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-orange-600">
                                    <svg
                                      className="w-3 h-3 mr-1 bg-orange-600 text-white rounded-full"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Voltooid
                                  </div>
                                  <span className="text-[#F59E0B] inter-tight-400 mt-1 text-xs">
                                    Fantastisch gedaan!
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="rounded-lg bg-[#FFFCE6] border border-yellow-200 p-3 flex items-center justify-center gap-2">
                                  <Star className="w-4 h-4 text-[#FACC15] fill-current" />
                                  <span className="text-sm inter-tight-400 font-medium text-gray-700">
                                    <span className="font-bold text-black inter-tight-700">{activity.rating}</span> (
                                    {activity.reviews})
                                  </span>
                                </div>

                                <div className="flex justify-center mt-2">
                                  <span className={`${activity.tagColor} px-3 py-1 rounded-full text-xs font-medium`}>
                                    {activity.tag}
                                  </span>
                                </div>
                                <button
                                  className={`w-full bg-gradient-to-br from-[#C42E8B] to-[#6650C7] text-white inter-tight-700 cursor-pointer py-2.5 px-4 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 mt-4 ${
                                    activity.isLocked ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  disabled={activity.isLocked}
                                >
                                  <IoPlayCircleOutline className="w-6 h-6" />
                                  Start Activiteit
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {renderPagination()}
              <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mt-6">
                <div className="lg:col-start-1 lg:col-end-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EducationalQuotes />
      <Specs />
      <Faqs />

      <ParentCoachBot />
    </>
  )
}

/* eslint-disable no-unused-vars */
import { useState, useCallback } from "react"
import {
  ChevronDown,
  Plus,
  ArrowLeft,
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
  Users,
  Lightbulb,
  Send,
  Clock,
  X,
} from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useGetAllActivities from "../../hooks/useGetAllActivity"
import useAdminActivityActions from "../../hooks/useAdminActivityActions"

export default function ActiviteitenBeheer() {
  const [selectedFilter, setSelectedFilter] = useState("Alle Activiteiten")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkActivities, setBulkActivities] = useState([{ title: "", description: "", instructions: "",  materials: ""  }])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const activitiesPerPage = 10

  // Convert filter to API-friendly format
  const apiFilter =
    selectedFilter === "Alle Activiteiten"
      ? ""
      : selectedFilter === "Actieve Activiteiten"
        ? "Actief"
        : selectedFilter === "Voltooide Activiteiten"
          ? "Voltooid"
          : "Concept"

  const { activities, loading, error, counts, refetch } = useGetAllActivities(apiFilter)
  const {
    deleteActivity,
    editActivity,
    loading: actionLoading,
    createActivity,
    createBulkActivities,
  } = useAdminActivityActions()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    materials: "",
    learningDomain: "",
    editingId: null,
    ageGroup: "",
    creatorName: "",
    time: "",
  })

  const [titleCount, setTitleCount] = useState(0)
  const [descriptionCount, setDescriptionCount] = useState(0)
  const [creatorCount, setCreatorCount] = useState(0)

  const filterOptions = [
    { label: "Alle Activiteiten", count: counts.all },
    { label: "Actieve Activiteiten", count: counts.active },
    { label: "Voltooide Activiteiten", count: counts.completed },
    { label: "Concept Activiteiten", count: counts.draft },
  ]

  // Pagination logic
  const indexOfLastActivity = currentPage * activitiesPerPage
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage
  const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity)
  const totalPages = Math.ceil(activities.length / activitiesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Refresh activities list
  const refreshActivities = useCallback(async () => {
    try {
      await refetch()
    } catch (error) {
      console.error("Error refreshing activities:", error)
    }
  }, [refetch])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    switch (field) {
      case "title":
        setTitleCount(value.length)
        break
      case "description":
        setDescriptionCount(value.length)
        break
      case "creatorName":
        setCreatorCount(value.length)
        break
    }
  }

  const handleBulkInputChange = (index, field, value) => {
    const updatedActivities = [...bulkActivities]
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: value,
    }
    setBulkActivities(updatedActivities)
  }

  const addBulkActivityField = () => {
    setBulkActivities([...bulkActivities, { title: "", description: "", instructions: "",  materials: ""  }])
  }

  const removeBulkActivityField = (index) => {
    if (bulkActivities.length > 1) {
      const updatedActivities = bulkActivities.filter((_, i) => i !== index)
      setBulkActivities(updatedActivities)
    }
  }

  const handleSubmit = async () => {
    if (bulkMode) {
      // Handle bulk submission
      const validActivities = bulkActivities.filter((activity) => activity.title.trim() && activity.description.trim())

      if (validActivities.length === 0) {
        toast.error("Voer minimaal één geldige activiteit in", {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      if (!formData.creatorName || !formData.learningDomain) {
        toast.error("Maker naam en leergebied zijn verplicht voor bulk activiteiten", {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      try {
        const bulkData = {
          activities: validActivities.map((activity) => ({
            title: activity.title,
            description: activity.description,
            instructions: activity.instructions
              ? activity.instructions
                  .split("\n")
                  .filter((step) => step.trim() !== "")
                  .map((step) => step.trim())
                  .slice(0, 5)
              : [],
              materials: activity.materials || undefined,
          })),
          creatorName: formData.creatorName,
          learningDomain: formData.learningDomain,
          ageGroup: formData.ageGroup || undefined,
          time: formData.time || undefined,
        }

        await createBulkActivities(bulkData)

        // Refresh activities list
        await refreshActivities()

        setActiveTab("list")
        setBulkActivities([{ title: "", description: "", instructions: "" }])
        setFormData({
          title: "",
          description: "",
          instructions: "",
          materials: "",
          learningDomain: "",
          editingId: null,
          ageGroup: "",
          creatorName: "",
          time: "",
        })

        toast.success(`${validActivities.length} activiteiten succesvol aangemaakt!`, {
          position: "top-right",
          autoClose: 3000,
        })
      } catch (err) {
        console.error(err)
        toast.error("Er is iets misgegaan bij het aanmaken van de activiteiten", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } else {
      if (
        !formData.title ||
        !formData.description ||
        !formData.learningDomain ||
        !formData.instructions ||
        !formData.creatorName
      ) {
        toast.error("Vul alle verplichte velden in", {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      const instructionsArray = formData.instructions
        .split("\n")
        .filter((step) => step.trim() !== "")
        .map((step) => step.trim())
        .slice(0, 5)

      if (instructionsArray.length === 0) {
        toast.error("Voeg minimaal één instructie stap toe", {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      for (const step of instructionsArray) {
        if (step.length > 180) {
          toast.error("Elke instructie stap mag maximaal 180 tekens bevatten", {
            position: "top-right",
            autoClose: 3000,
          })
          return
        }
      }

      try {
        if (formData.editingId) {
          const updates = {
            title: formData.title,
            description: formData.description,
            instructions: instructionsArray,
            materials: formData.materials,
            learningDomain: formData.learningDomain,
            ageGroup: formData.ageGroup,
            creatorName: formData.creatorName,
            time: formData.time,
            status: "Actief",
          }

          await editActivity(formData.editingId, updates)

          // Refresh activities list
          await refreshActivities()

          toast.success("Activiteit succesvol bijgewerkt!", {
            position: "top-right",
            autoClose: 3000,
          })
        } else {
          const activityData = {
            title: formData.title,
            description: formData.description,
            instructions: instructionsArray,
            materials: formData.materials,
            learningDomain: formData.learningDomain,
            ageGroup: formData.ageGroup,
            creatorName: formData.creatorName,
            time: formData.time,
            status: "Actief",
          }

          await createActivity(activityData)

          // Refresh activities list
          await refreshActivities()

          toast.success("Activiteit succesvol aangemaakt!", {
            position: "top-right",
            autoClose: 3000,
          })
        }

        setActiveTab("list")
        setFormData({
          title: "",
          description: "",
          instructions: "",
          materials: "",
          learningDomain: "",
          editingId: null,
          ageGroup: "",
          creatorName: "",
          time: "",
        })
      } catch (err) {
        console.error(err)
        toast.error("Er is iets misgegaan bij het opslaan van de activiteit", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    }
  }

  const handleEdit = (activity) => {
    setFormData({
      title: activity.title,
      description: activity.description,
      instructions: activity.instructions.join("\n"),
      materials: activity.materials,
      learningDomain: activity.learningDomain,
      ageGroup: activity.ageGroup || "",
      creatorName: activity.creatorName,
      time: activity.time,
      editingId: activity._id,
    })
    setBulkMode(false)
    setActiveTab("create")
  }

  const handleDeleteClick = (activity) => {
    setActivityToDelete(activity)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!activityToDelete) return

    setDeleteLoading(true)

    try {
      await deleteActivity(activityToDelete._id)

      // Refresh activities list
      await refreshActivities()

      toast.success("Activiteit is succesvol verwijderd", {
        position: "top-right",
        autoClose: 3000,
      })

      setShowDeleteModal(false)
      setActivityToDelete(null)

      if (currentActivities.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Er is iets misgegaan bij het verwijderen", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setActivityToDelete(null)
  }

  // if (loading) return <LoaderOverlay />;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 10000000000 }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 inter-tight-600">Activiteit Verwijderen</h2>
              <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-2">
              <p className="text-gray-600 mb-2 inter-tight-400">Weet u zeker dat u de volgende activiteit wilt verwijderen?</p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-500">
                <h3 className="font-semibold text-gray-900 inter-tight-600">{activityToDelete?.title}</h3>
                <p className="text-sm text-gray-600 mt-1 inter-tight-400">{activityToDelete?.description}</p>
                <p className="text-xs text-gray-500 mt-2 inter-tight-400">
                  Leergebied: {activityToDelete?.learningDomain} • Maker: {activityToDelete?.creatorName}
                </p>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium inter-tight-400">⚠️ Deze actie kan niet ongedaan worden gemaakt.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 inter-tight-400 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white text-sm inter-tight-400 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 inter-tight-400 text-sm border-white border-t-transparent rounded-full animate-spin"></div>
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4" />
                    Verwijderen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "list" ? (
            <div className="border border-[#E2E4E9] p-6 rounded-xl bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-8">
                <div className="">
                  <h1 className="text-2xl text-[#000000] inter-tight-700 font-semibold mb-2">Activiteiten Beheer</h1>
                  <p className="text-[#838383] text-[16px] inter-tight-400">
                    Beheer alle activiteiten: status wijzigen, verbergen of permanent verwijderen
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        title: "",
                        description: "",
                        instructions: "",
                        materials: "",
                        learningDomain: "",
                        editingId: null,
                        ageGroup: "",
                        creatorName: "",
                        time: "",
                      })
                      setBulkMode(false)
                      setActiveTab("create")
                    }}
                    className="bg-[#000000] cursor-pointer inter-tight-400 justify-center text-sm text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Nieuwe Activiteit
                  </button>
                  <button
                    onClick={() => {
                      setBulkMode(true)
                      setBulkActivities([{ title: "", description: "", instructions: "" }])
                      setFormData({
                        title: "",
                        description: "",
                        instructions: "",
                        materials: "",
                        learningDomain: "",
                        editingId: null,
                        ageGroup: "",
                        creatorName: "",
                        time: "",
                      })
                      setActiveTab("create")
                    }}
                    className="bg-[#6366F1] cursor-pointer inter-tight-400 justify-center text-sm text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-[#4F46E5] transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Bulk Activiteiten
                  </button>
                </div>
              </div>

              <div className="rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="bg-white border border-gray-300 text-[#707070] rounded-lg px-4 py-2.5 flex justify-between items-center gap-2 hover:bg-gray-50 transition-colors min-w-64"
                    >
                      <span className="text-gray-700">{selectedFilter}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full text-sm text-[#707070] left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {filterOptions.map((option) => (
                          <button
                            key={option.label}
                            onClick={() => {
                              setSelectedFilter(option.label)
                              setIsDropdownOpen(false)
                              setCurrentPage(1)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors flex justify-between items-center"
                          >
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-[#707070] inter-tight-400">
                    <span className="font-medium text-black inter-tight-400">
                      {selectedFilter === "Alle Activiteiten"
                        ? counts.all
                        : selectedFilter === "Actieve Activiteiten"
                          ? counts.active
                          : selectedFilter === "Voltooide Activiteiten"
                            ? counts.completed
                            : counts.draft}
                    </span>{" "}
                    {selectedFilter}
                  </div>
                </div>
              </div>

              {error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Titel
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Leergebied
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Aangemaakt
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Maker
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Acties
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentActivities.length > 0 ? (
                            currentActivities.map((activity) => (
                              <tr key={activity._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{activity.title}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{activity.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {activity.learningDomain}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(activity.createdAt).toLocaleDateString("nl-NL")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {activity.creatorName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEdit(activity)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(activity)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                Geen activiteiten gevonden voor {selectedFilter}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {activities.length > activitiesPerPage && (
                    <div className="flex items-center inter-tight-400 text-sm cursor-pointer justify-between mt-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-3 py-1">...</span>}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <button
                            onClick={() => paginate(totalPages)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === totalPages
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {totalPages}
                          </button>
                        )}

                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === totalPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="border border-[#E2E4E9] p-6 rounded-xl bg-white">
              <div className="mb-8">
                <button
                  onClick={() => setActiveTab("list")}
                  className="flex cursor-pointer items-center gap-2 text-[#4B5563] hover:bg-yellow-400 hover:text-black py-2 px-6 duration-500 ease-in-out rounded-md transition-colors mb-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Terug naar activiteiten</span>
                </button>

                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-[#6366F1] rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-3">
                      {formData.editingId
                        ? "Activiteit Bewerken"
                        : bulkMode
                          ? "Bulk Activiteiten Toevoegen"
                          : "Nieuwe Activiteit Toevoegen"}
                    </h1>
                    <p className="text-[#6B7280] text-[16px] max-w-md mx-auto">
                      {formData.editingId
                        ? "Bewerk de details van deze activiteit"
                        : bulkMode
                          ? "Voeg meerdere activiteiten in één keer toe"
                          : "Voeg een nieuwe activiteit toe aan het platform"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                    <h2 className="text-2xl font-semibold text-[#000000]">Activiteit Details</h2>
                  </div>
                </div>

                {bulkMode ? (
                  <div className="space-y-6">
                    {bulkActivities.map((activity, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Activiteit #{index + 1}</h3>
                          {bulkActivities.length > 1 && (
                            <button
                              onClick={() => removeBulkActivityField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[#000000] mb-2">
                            Titel <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) => handleBulkInputChange(index, "title", e.target.value)}
                            placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                            maxLength={60}
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[#000000] mb-2">
                            Beschrijving <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={activity.description}
                            onChange={(e) => handleBulkInputChange(index, "description", e.target.value)}
                            placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                            rows="3"
                            maxLength={250}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#000000] mb-2">Instructies</label>
                          <textarea
                            value={activity.instructions}
                            onChange={(e) => handleBulkInputChange(index, "instructions", e.target.value)}
                            placeholder={`1. Stap 1\n2. Stap 2\n3. Stap 3`}
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                            rows="4"
                          />
                          <p className="text-xs text-[#6B7280] mt-1">
                            Gebruik genummerde stappen (1., 2., etc.). Maximaal 5 stappen, elke stap maximaal 180
                            tekens.
                          </p>
                        </div>

                        <div className="mb-4">
          <label className="block text-sm font-medium text-[#000000] mb-2">Benodigd materiaal</label>
          <input
            type="text"
            value={activity.materials}
            onChange={(e) => handleBulkInputChange(index, "materials", e.target.value)}
            placeholder="Papier, kleurpotloden, etc."
            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
          />
          <p className="text-xs text-[#6B7280] mt-1">Kommagescheiden lijst van benodigdheden (optioneel)</p>
        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addBulkActivityField}
                      className="flex items-center gap-2 text-[#6366F1] hover:text-[#4F46E5]"
                    >
                      <Plus className="w-4 h-4" />
                      Nog een activiteit toevoegen
                    </button>

                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#000000] mb-2">
                          Maker Naam <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.creatorName}
                          onChange={(e) => handleInputChange("creatorName", e.target.value)}
                          placeholder="Naam van de maker"
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                          maxLength={60}
                        />
                        <p className="text-xs text-[#6B7280] mt-1">Maximaal 60 tekens ({creatorCount}/60)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#000000] mb-2">
                          Leergebied voor alle activiteiten <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.learningDomain}
                          onChange={(e) => handleInputChange("learningDomain", e.target.value)}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                          required
                        >
                          <option value="">Selecteer een leergebied</option>
                          <option value="Emotionele Gezondheid">Emotionele Gezondheid</option>
                          <option value="Veerkracht">Veerkracht</option>
                          <option value="Dankbaarheid">Dankbaarheid</option>
                          <option value="Zelfzorg">Zelfzorg</option>
                          <option value="Geldwijsheid">Geldwijsheid</option>
                          <option value="Ondernemerschap">Ondernemerschap</option>
                          <option value="Anders denken">Anders denken</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#000000] mb-2">Leeftijdsgroep</label>
                        <select
                          value={formData.ageGroup}
                          onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                        >
                          <option value="">Selecteer een leeftijdsgroep</option>
                          <option value="3 - 4">Age 3 - 4</option>
                          <option value="3 - 6">Age 3 - 6</option>
                          <option value="5 - 6">Age 5 - 6</option>
                          <option value="7 - 8">Age 7 - 8</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#000000] mb-2">
                          Geschatte duur (minuten)
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={formData.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            placeholder="Bijvoorbeeld: 10 of 10-15"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                          />
                          <Clock className="w-4 h-4 text-gray-400 absolute right-3" />
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1">
                          Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r cursor-pointer from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2 mt-6"
                    >
                      <Send className="w-5 h-5" />
                      {bulkActivities.length > 1
                        ? `${bulkActivities.length} Activiteiten Aanmaken`
                        : "Activiteit Aanmaken"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Titel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                        maxLength={60}
                      />
                      <p className="text-xs text-[#6B7280] mt-1">Maximaal 60 tekens ({titleCount}/60)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Beschrijving <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                        rows="4"
                        maxLength={250}
                      />
                      <p className="text-xs text-[#6B7280] mt-1">Maximaal 250 tekens ({descriptionCount}/250)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Maker Naam <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.creatorName}
                        onChange={(e) => handleInputChange("creatorName", e.target.value)}
                        placeholder="Naam van de maker"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                        maxLength={60}
                      />
                      <p className="text-xs text-[#6B7280] mt-1">Maximaal 60 tekens ({creatorCount}/60)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Instructies <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => handleInputChange("instructions", e.target.value)}
                        placeholder={`1. Neem een vel papier\n2. Vouw het dubbel in de lengte\n3. Maak de neus door de bovenste hoeken naar beneden te vouwen\n4. Vouw de zijkanten naar binnen om vleugels te vormen\n5. Lanceer en kijk hoe ver het vliegt!`}
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                        rows="6"
                      />
                      <p className="text-xs text-[#6B7280] mt-1">
                        Gebruik genummerde stappen (1., 2., etc.). Maximaal 5 stappen, elke stap maximaal 180 tekens.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">Benodigd materiaal</label>
                      <input
                        type="text"
                        value={formData.materials}
                        onChange={(e) => handleInputChange("materials", e.target.value)}
                        placeholder="Papier, kleurpotloden, telefoon voor foto's"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-[#6B7280] mt-1">Kommagescheiden lijst van benodigdheden (optioneel)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Leergebied <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.learningDomain}
                        onChange={(e) => handleInputChange("learningDomain", e.target.value)}
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                        required
                      >
                        <option value="">Selecteer een leergebied</option>
                        <option value="Emotionele Gezondheid">Emotionele Gezondheid</option>
                        <option value="Veerkracht">Veerkracht</option>
                        <option value="Dankbaarheid">Dankbaarheid</option>
                        <option value="Zelfzorg">Zelfzorg</option>
                        <option value="Geldwijsheid">Geldwijsheid</option>
                        <option value="Ondernemerschap">Ondernemerschap</option>
                        <option value="Anders denken">Anders denken</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">Geschatte duur (minuten)</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => handleInputChange("time", e.target.value)}
                          placeholder="Bijvoorbeeld: 10 of 10-15"
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                        />
                        <Clock className="w-4 h-4 text-gray-400 absolute right-3" />
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">Leeftijdsgroep</label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                      >
                        <option value="">Selecteer een leeftijdsgroep</option>
                        <option value="3 - 4">Age 3 - 4</option>
                        <option value="3 - 6">Age 3 - 6</option>
                        <option value="5 - 6">Age 5 - 6</option>
                        <option value="7 - 8">Age 7 - 8</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r cursor-pointer from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      {formData.editingId ? "Activiteit Bijwerken" : "Activiteit Aanmaken"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

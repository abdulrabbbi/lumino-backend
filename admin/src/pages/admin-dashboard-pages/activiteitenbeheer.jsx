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
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkActivities, setBulkActivities] = useState([
    { title: "", description: "", instructions: "", materials: "", effect: "" },
  ])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const activitiesPerPage = 30

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
    effect: "",
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

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.learningDomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastActivity = currentPage * activitiesPerPage
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

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
    setBulkActivities([...bulkActivities, { title: "", description: "", instructions: "", materials: "", effect: "" }])
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
      if (!formData.learningDomain) {
        toast.error("Leergebied is verplicht voor bulk activiteiten", {
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
            effect: activity.effect || undefined,
          })),
          // Alleen creatorName meesturen als het niet leeg is
          creatorName: formData.creatorName.trim() || undefined,
          learningDomain: formData.learningDomain,
          ageGroup: formData.ageGroup || undefined,
          time: formData.time || undefined,
        }
        await createBulkActivities(bulkData)
        // Refresh activities list
        await refreshActivities()
        setActiveTab("list")
        setBulkActivities([{ title: "", description: "", instructions: "", effect: "" }])
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
          effect: "",
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
        !formData.instructions 
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
            // Alleen creatorName meesturen als het niet leeg is
            creatorName: formData.creatorName.trim() || undefined,
            time: formData.time,
            status: "Actief",
            effect: formData.effect,
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
            // Alleen creatorName meesturen als het niet leeg is
            creatorName: formData.creatorName.trim() || undefined,
            time: formData.time,
            status: "Actief",
            effect: formData.effect,
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
          effect: "",
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
      effect: activity.effect,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
          <div className="mx-4 w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="inter-tight-600 text-xl font-semibold text-gray-900">Activiteit Verwijderen</h2>
              <button onClick={cancelDelete} className="text-gray-400 transition-colors hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-2">
              <p className="inter-tight-400 mb-2 text-gray-600">
                Weet u zeker dat u de volgende activiteit wilt verwijderen?
              </p>
              <div className="rounded-lg border-l-4 border-red-500 bg-gray-50 p-4">
                <h3 className="inter-tight-600 font-semibold text-gray-900">{activityToDelete?.title}</h3>
                <p className="inter-tight-400 mt-1 text-sm text-gray-600">{activityToDelete?.description}</p>
                <p className="inter-tight-400 mt-2 text-xs text-gray-500">
                  {" "}
                  Leergebied: {activityToDelete?.learningDomain} • Maker: {activityToDelete?.creatorName}
                </p>
              </div>
              <p className="inter-tight-400 mt-3 text-sm font-medium text-red-600">
                ⚠️ Deze actie kan niet ongedaan worden gemaakt.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="inter-tight-400 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="inter-tight-400 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <div className="inter-tight-400 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent text-sm"></div>{" "}
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4" /> Verwijderen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl">
          {activeTab === "list" ? (
            <div className="rounded-xl border border-[#E2E4E9] bg-white p-6">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="">
                  <h1 className="inter-tight-700 mb-2 text-2xl font-semibold text-[#000000]">Activiteiten Beheer</h1>
                  <p className="inter-tight-400 text-[16px] text-[#838383]">
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
                        effect: "",
                      })
                      setBulkMode(false)
                      setActiveTab("create")
                    }}
                    className="inter-tight-400 flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#000000] px-4 py-3 text-sm text-white transition-colors hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4" /> Nieuwe Activiteit
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
                        effect: "",
                      })
                      setActiveTab("create")
                    }}
                    className="inter-tight-400 flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#6366F1] px-4 py-3 text-sm text-white transition-colors hover:bg-[#4F46E5]"
                  >
                    <Plus className="h-4 w-4" /> Bulk Activiteiten
                  </button>
                </div>
              </div>

              <div className="relative w-full mb-2 sm:w-auto">
                <input
                  type="text"
                  placeholder="Zoek activiteiten..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-300 text-sm  bg-white px-4 py-3 pl-10 text-[#707070] transition-colors hover:bg-gray-50 outline-none"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mb-6 rounded-lg">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="min-w-64 flex justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[#707070] transition-colors hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{selectedFilter}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg text-sm text-[#707070]">
                        {filterOptions.map((option) => (
                          <button
                            key={option.label}
                            onClick={() => {
                              setSelectedFilter(option.label)
                              setIsDropdownOpen(false)
                              setCurrentPage(1)
                            }}
                            className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                          >
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="inter-tight-400 text-[#707070]">
                    <span className="inter-tight-400 font-medium text-black">
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
                <div className="py-4 text-center text-red-500">{error}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Titel
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Leergebied
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Aangemaakt
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Maker
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Acties
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentActivities.length > 0 ? (
                            currentActivities.map((activity) => (
                              <tr key={activity._id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div className="font-medium text-gray-900">{activity.title}</div>
                                  <div className="line-clamp-1 text-sm text-gray-500">{activity.description}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {activity.learningDomain}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {new Date(activity.createdAt).toLocaleDateString("nl-NL")}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {activity.creatorName}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEdit(activity)}
                                    className="mr-4 text-indigo-600 hover:text-indigo-900"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(activity)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                {" "}
                                Geen activiteiten gevonden voor {selectedFilter}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {activities.length > activitiesPerPage && (
                    <div className="inter-tight-400 mt-6 flex cursor-pointer items-center justify-between text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-md ${currentPage === 1
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {(() => {
                          const pagesToRender = []
                          const maxVisiblePages = 5 // Number of page buttons to show in the main block

                          let startPageNum = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                          let endPageNum = Math.min(totalPages, currentPage + Math.floor(maxVisiblePages / 2))

                          // Adjust start/end to ensure maxVisiblePages are shown if possible
                          if (endPageNum - startPageNum + 1 < maxVisiblePages) {
                            if (startPageNum === 1) {
                              endPageNum = Math.min(totalPages, maxVisiblePages)
                            } else if (endPageNum === totalPages) {
                              startPageNum = Math.max(1, totalPages - maxVisiblePages + 1)
                            }
                          }

                          // Ensure startPageNum is at least 1
                          startPageNum = Math.max(1, startPageNum)
                          // Ensure endPageNum does not exceed totalPages
                          endPageNum = Math.min(totalPages, endPageNum)

                          // Add page 1 and ellipsis if needed
                          if (startPageNum > 1) {
                            pagesToRender.push(1)
                            if (startPageNum > 2) {
                              // Only show ellipsis if there's more than just page 1 before the block
                              pagesToRender.push("ellipsis-start")
                            }
                          }

                          // Add pages in the calculated range
                          for (let i = startPageNum; i <= endPageNum; i++) {
                            pagesToRender.push(i)
                          }

                          // Add ellipsis and last page if needed
                          if (endPageNum < totalPages) {
                            if (endPageNum < totalPages - 1) {
                              // Only show ellipsis if there's more than just the last page after the block
                              pagesToRender.push("ellipsis-end")
                            }
                            pagesToRender.push(totalPages)
                          }

                          return pagesToRender.map((page) => {
                            if (typeof page === "string" && page.startsWith("ellipsis")) {
                              return (
                                <span key={page} className="px-3 py-1">
                                  ...
                                </span>
                              )
                            }
                            return (
                              <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-3 py-1 rounded-md ${currentPage === page
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          })
                        })()}

                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md ${currentPage === totalPages
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E2E4E9] bg-white p-6">
              <div className="mb-8">
                <button
                  onClick={() => setActiveTab("list")}
                  className="mb-6 flex cursor-pointer items-center gap-2 rounded-md px-6 py-2 text-[#4B5563] transition-colors duration-500 ease-in-out hover:bg-yellow-400 hover:text-black"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Terug naar activiteiten</span>
                </button>
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6366F1]">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="mb-3 text-3xl font-bold text-[#1F2937] md:text-4xl">
                      {formData.editingId
                        ? "Activiteit Bewerken"
                        : bulkMode
                          ? "Bulk Activiteiten Toevoegen"
                          : "Nieuwe Activiteit Toevoegen"}
                    </h1>
                    <p className="mx-auto max-w-md text-[16px] text-[#6B7280]">
                      {formData.editingId
                        ? "Bewerk de details van deze activiteit"
                        : bulkMode
                          ? "Voeg meerdere activiteiten in één keer toe"
                          : "Voeg een nieuwe activiteit toe aan het platform"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
                    <h2 className="text-2xl font-semibold text-[#000000]">Activiteit Details</h2>
                  </div>
                </div>
                {bulkMode ? (
                  <div className="space-y-6">
                    {bulkActivities.map((activity, index) => (
                      <div key={index} className="relative rounded-lg border border-gray-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-medium">Activiteit #{index + 1}</h3>
                          {bulkActivities.length > 1 && (
                            <button
                              onClick={() => removeBulkActivityField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-[#000000]">
                            Titel <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) => handleBulkInputChange(index, "title", e.target.value)}
                            placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                            maxLength={60}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-[#000000]">
                            Beschrijving <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={activity.description}
                            onChange={(e) => handleBulkInputChange(index, "description", e.target.value)}
                            placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                            className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                            rows="3"
                            maxLength={250}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#000000]">Instructies</label>
                          <textarea
                            value={activity.instructions}
                            onChange={(e) => handleBulkInputChange(index, "instructions", e.target.value)}
                            placeholder={`1. Stap 1\n2. Stap 2\n3. Stap 3`}
                            className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                            rows="4"
                          />
                          <p className="mt-1 text-xs text-[#6B7280]">
                            Gebruik genummerde stappen (1., 2., etc.). Maximaal 5 stappen, elke stap maximaal 180
                            tekens.
                          </p>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#000000]">Effect</label>
                          <input
                            type="text"
                            value={formData.effect}
                            onChange={(e) => handleInputChange("effect", e.target.value)}
                            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-[#000000]">Benodigd materiaal</label>
                          <input
                            type="text"
                            value={activity.materials}
                            onChange={(e) => handleBulkInputChange(index, "materials", e.target.value)}
                            placeholder="Papier, kleurpotloden, etc."
                            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                          />
                          <p className="mt-1 text-xs text-[#6B7280]">
                            Kommagescheiden lijst van benodigdheden (optioneel)
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBulkActivityField}
                      className="flex items-center gap-2 text-[#6366F1] hover:text-[#4F46E5]"
                    >
                      <Plus className="h-4 w-4" /> Nog een activiteit toevoegen
                    </button>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#000000]">
                          Maker Naam 
                        </label>
                        <input
                          type="text"
                          value={formData.creatorName}
                          onChange={(e) => handleInputChange("creatorName", e.target.value)}
                          placeholder="Naam van de maker"
                          className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                          maxLength={60}
                        />
                        <p className="mt-1 text-xs text-[#6B7280]">Maximaal 60 tekens ({creatorCount}/60)</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#000000]">
                          Leergebied voor alle activiteiten <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.learningDomain}
                          onChange={(e) => handleInputChange("learningDomain", e.target.value)}
                          className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
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
                        <label className="mb-2 block text-sm font-medium text-[#000000]">Leeftijdsgroep</label>
                        <select
                          value={formData.ageGroup}
                          onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                          className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        >
                          <option value="">Selecteer een leeftijdsgroep</option>
                          <option value="3 - 4">Age 3 - 4</option>
                          <option value="3 - 6">Age 3 - 6</option>
                          <option value="5 - 6">Age 5 - 6</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#000000]">
                          Geschatte duur (minuten)
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={formData.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            placeholder="Bijvoorbeeld: 10 of 10-15"
                            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                          />
                          <Clock className="absolute right-3 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-3 text-white shadow-lg transition-all duration-500 hover:scale-105 hover:from-[#5B21B6] hover:to-[#7C3AED] hover:shadow-xl"
                    >
                      <Send className="h-5 w-5" />
                      {bulkActivities.length > 1
                        ? `${bulkActivities.length} Activiteiten Aanmaken`
                        : "Activiteit Aanmaken"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">
                        Titel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        maxLength={60}
                      />
                      <p className="mt-1 text-xs text-[#6B7280]">Maximaal 60 tekens ({titleCount}/60)</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">
                        Beschrijving <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                        className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        rows="4"
                        maxLength={250}
                      />
                      <p className="mt-1 text-xs text-[#6B7280]">Maximaal 250 tekens ({descriptionCount}/250)</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">
                        Maker Naam 
                      </label>
                      <input
                        type="text"
                        value={formData.creatorName}
                        onChange={(e) => handleInputChange("creatorName", e.target.value)}
                        placeholder="Naam van de maker"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        maxLength={60}
                      />
                      <p className="mt-1 text-xs text-[#6B7280]">Maximaal 60 tekens ({creatorCount}/60)</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">
                        Instructies <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => handleInputChange("instructions", e.target.value)}
                        placeholder={`1. Neem een vel papier\n2. Vouw het dubbel in de lengte\n3. Maak de neus door de bovenste hoeken naar beneden te vouwen\n4. Vouw de zijkanten naar binnen om vleugels te vormen\n5. Lanceer en kijk hoe ver het vliegt!`}
                        className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        rows="6"
                      />
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Gebruik genummerde stappen (1., 2., etc.). Maximaal 5 stappen, elke stap maximaal 180 tekens.
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">Benodigd materiaal</label>
                      <input
                        type="text"
                        value={formData.materials}
                        onChange={(e) => handleInputChange("materials", e.target.value)}
                        placeholder="Papier, kleurpotloden, telefoon voor foto's"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-[#6B7280]">Kommagescheiden lijst van benodigdheden (optioneel)</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">
                        Leergebied <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.learningDomain}
                        onChange={(e) => handleInputChange("learningDomain", e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
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
                      <label className="mb-2 block text-sm font-medium text-[#000000]">Effect</label>
                      <input
                        type="text"
                        value={formData.effect}
                        onChange={(e) => handleInputChange("effect", e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">Geschatte duur (minuten)</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => handleInputChange("time", e.target.value)}
                          placeholder="Bijvoorbeeld: 10 of 10-15"
                          className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        />
                        <Clock className="absolute right-3 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#000000]">Leeftijdsgroep</label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      >
                        <option value="">Selecteer een leeftijdsgroep</option>
                        <option value="3 - 4">Age 3 - 4</option>
                        <option value="3 - 6">Age 3 - 6</option>
                        <option value="5 - 6">Age 5 - 6</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-3 text-white shadow-lg transition-all duration-500 hover:scale-105 hover:from-[#5B21B6] hover:to-[#7C3AED] hover:shadow-xl"
                    >
                      <Send className="h-5 w-5" />
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

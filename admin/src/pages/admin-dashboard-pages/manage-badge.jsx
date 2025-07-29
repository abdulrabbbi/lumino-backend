/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { Edit3, Trash2, Badge, ChevronDown, Upload, X } from "lucide-react"
import useBadgesApi from "../../hooks/useBadgesApi"
import LoaderOverlay from "../../components/LoaderOverlay"

const ManageBadge = () => {
  const [activeTab, setActiveTab] = useState("CORE PROGRESSION")
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingBadge, setEditingBadge] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [badgeToDelete, setBadgeToDelete] = useState(null)
  const [formData, setFormData] = useState({
    category: "Core Progression", // This is the UI form value
    name: "",
    description: "",
    photo: null,
  })

  const tabs = ["CORE PROGRESSION", "LEARNING AREA BADGES", "SPECIAL & BONUS BADGES", "HIGH ACHIEVER BADGES"]

  const { badges, loading, error, fetchBadges, createBadge, updateBadge, deleteBadge } = useBadgesApi()

  // Fetch badges on component mount
  useEffect(() => {
    fetchBadges()
  }, [])

  // Function to map UI display category names (from API transformed data) to UI form names
  const mapUiDisplayCategoryToUiForm = (uiDisplayCategory) => {
    switch (uiDisplayCategory) {
      case "CORE PROGRESSION":
        return "Core Progression"
      case "LEARNING AREA BADGES":
        return "Learning area"
      case "SPECIAL & BONUS BADGES":
        return "Special & bonus"
      case "HIGH ACHIEVER BADGES":
        return "High achiever"
      default:
        return "Core progression" // Fallback
    }
  }

  // Filter badges based on active tab (which now directly matches the transformed badge.category)
  const filteredBadges = badges.filter((badge) => badge.category === activeTab)

  const handleCreateBadge = () => {
    setIsCreating(true)
    setIsEditing(false)
    setEditingBadge(null)
    setFormData({
      category: "Core progression",
      name: "",
      description: "",
      photo: null,
    })
  }

  const handleEditBadge = (badge) => {
    setIsEditing(true)
    setIsCreating(false)
    setEditingBadge(badge)

    setFormData({
      category: mapUiDisplayCategoryToUiForm(badge.category), // Map transformed API category back to UI form category
      name: badge.name,
      description: badge.description,
      photo: null, // Photo needs to be re-uploaded or handled differently if you want to display existing
    })
  }

  const handleDeleteBadge = (badge) => {
    setBadgeToDelete(badge)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (badgeToDelete) {
      try {
        await deleteBadge(badgeToDelete._id)
        setShowDeleteModal(false)
        setBadgeToDelete(null)
      } catch (err) {
        console.error("Failed to delete badge:", err)
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setBadgeToDelete(null)
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setIsEditing(false)
    setEditingBadge(null)
    setFormData({
      category: "Core progression",
      name: "",
      description: "",
      photo: null,
    })
  }

  const handlePublish = async () => {
    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("category", formData.category) // formData.category is already the UI form value
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo)
    }

    try {
      if (isEditing && editingBadge) {
        await updateBadge(editingBadge._id, formDataToSend)
      } else {
        await createBadge(formDataToSend)
      }
      handleBackToList()
    } catch (err) {
      console.error("Failed to save badge:", err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Delete Modal Component
  const DeleteModal = () => {
    if (!showDeleteModal) return null
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#262F40] poppins-700">Delete Badge</h3>
            <button onClick={cancelDelete} className="text-gray-400 cursor-pointer hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#262F40] text-[16px] inter-tight-400 mb-6">
            Are you sure you want to delete "{badgeToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 text-sm inter-tight-400 cursor-pointer text-[#262F40] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm inter-tight-400 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !isCreating && !isEditing) {
   <LoaderOverlay/>
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto border border-[#E2E4E9] md:h-[500px] h-full rounded-md p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button onClick={fetchBadges} className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isCreating || isEditing) {
    return (
      <div className="">
        <div className="max-w-7xl mx-auto border border-[#E2E4E9] md:h-[500px] h-full rounded-md p-6">
          {/* Create/Edit Badge Header */}
          <div className="mb-8">
            <h1 className="text-xl lg:text-[24px] inter-tight-400 text-[#262F40]">
              {isEditing ? "Edit badge" : "Create new badge"}
            </h1>
          </div>
          {/* Create/Edit Badge Form */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Category Dropdown */}
              <div className="p-4 relative">
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full appearance-none bg-transparent text-[#262F40] text-sm inter-tight-400 focus:outline-none cursor-pointer pr-8"
                  >
                    <option value="Core Progression">Core Progression</option>
                    <option value="Learning area">Learning area</option>
                    <option value="Special & bonus">Special & bonus</option>
                    <option value="High achiever">High achiever</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-transparent placeholder-[#262F40] text-sm inter-tight-400 text-[#262F40] outline-none"
                />
              </div>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full bg-transparent text-sm inter-tight-400 text-[#262F40] placeholder-[#262F40] focus:outline-none"
                />
              </div>
              {/* Upload Photo */}
              <div className="p-4">
                <label htmlFor="photo-upload" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-[#262F40]" />
                  <span className="text-sm inter-tight-400 text-[#262F40]">upload photo</span>
                  {formData.photo && (
                    <span className="text-xs text-gray-500 truncate max-w-xs">{formData.photo.name}</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange("photo", e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
              </div>
              {/* Publish Button */}
              <div className="p-4 flex items-center">
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className={`w-full ${
                    loading ? "bg-gray-400" : "bg-[#16A34A] hover:bg-green-700"
                  } text-white px-4 py-2 rounded-lg text-sm inter-tight-400 transition-colors`}
                >
                  {loading ? "Processing..." : isEditing ? "Update" : "Publish"}
                </button>
              </div>
            </div>
          </div>
          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={handleBackToList}
              className="text-[#262F40] text-sm inter-tight-400 hover:text-gray-600 transition-colors"
            >
              ← Back to badges
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="max-w-7xl mx-auto border border-[#E2E4E9]  h-full rounded-md p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-xl lg:text-[24px] inter-tight-400 text-[#262F40]">Manage badge</h1>
          <button
            onClick={handleCreateBadge}
            className="bg-[#16A34A] inter-tight-400 text-sm cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Badge className="w-4 h-4" />
            Create new badge
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "border-gray-900 text-[#060606]"
                      : "border-transparent text-[#6B7280] hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-0">
            {filteredBadges.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredBadges.map((badge) => (
                  <div
                    key={badge._id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="md:col-span-3 flex items-center">
                      <span className="text-[#262F40] font-medium text-sm inter-tight-400">{badge.name}</span>
                    </div>
                    <div className="md:col-span-4 flex items-center">
                      <span className="text-[#262F40] text-sm inter-tight-400">{badge.description}</span>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center md:justify-start">
                      <div className="w-12 h-12 bg-[#FFFCF8] rounded-xl shadow-xl flex items-center justify-center">
                        {badge.photoUrl ? (
                          <img
                            src={badge.photoUrl || "/placeholder.svg"}
                            alt={badge.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span className="text-xl">🏆</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleEditBadge(badge)}
                        className="flex items-center gap-2 px-5 py-2 text-[#262F40] bg-[#F7FAFC] text-sm cursor-pointer border border-[#E2E4E9] rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge)}
                        className="flex items-center gap-2 px-5 py-2 text-[#262F40] bg-[#F7FAFC] text-sm cursor-pointer border border-[#E2E4E9] rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <h3 className="text-[24px] inter-tight-400 mb-2">No badges found</h3>
                <p className="text-gray-500 mb-6 text-sm inter-tight-400">
                  Get started by creating your first badge for this category.
                </p>
                <div className="flex justify-center items-center">
                  <button
                    onClick={handleCreateBadge}
                    className="bg-[#16A34A] inter-tight-400 text-sm cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg justify-center flex items-center gap-2 transition-colors"
                  >
                    <Badge className="w-4 h-4" />
                    Create new badge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DeleteModal />
    </div>
  )
}

export default ManageBadge

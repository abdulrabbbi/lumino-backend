import { useState, useEffect } from "react"
import { Trash2, ChevronLeft, ChevronRight, Edit } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "../../utils/api"
import LoaderOverlay from "../../components/LoaderOverlay"
import { ToastContainer, toast } from "react-toastify"

export default function TestgroepAanmeldingen() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // New state for password update modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false)
  const [passwordUpdateError, setPasswordUpdateError] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const recordsPerPage = 20

  useEffect(() => {
    const fetchTestUsers = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken")
        const response = await axios.get(`${BASE_URL}/get-all-test-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          const transformedData = response.data.users.map((user) => ({
            id: user._id,
            naam: user.username,
            email: user.email,
            leeftijdKind: user.ageGroup || "Niet opgegeven",
            aangemeldOp: formatDate(user.createdAt),
          }))
          setRegistrations(transformedData)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTestUsers()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "Onbekende datum"
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleUpdatePasswordClick = (user) => {
    setUserToUpdate(user)
    setShowPasswordModal(true)
    setNewPassword("")
    setPasswordUpdateError(null)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const token = localStorage.getItem("adminAuthToken")
      const response = await axios.delete(`${BASE_URL}/delete-test-user/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success("User has been deleted")
        setRegistrations(registrations.filter((user) => user.id !== userToDelete.id))
        setShowDeleteModal(false)

        // Adjust current page if necessary after deletion
        const newTotalRecords = registrations.length - 1
        const newTotalPages = Math.ceil(newTotalRecords / recordsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "failed to delete the user")
      setDeleteError(err.response?.data?.message || err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
    setDeleteError(null)
  }

  const handlePasswordUpdate = async () => {
    if (!userToUpdate || !newPassword) {
      setPasswordUpdateError("Please enter a new password")
      return
    }

    setPasswordUpdateLoading(true)
    setPasswordUpdateError(null)

    try {
      const token = localStorage.getItem("adminAuthToken")
      const response = await axios.post(
        `${BASE_URL}/change-test-users-password`,
        {
          userId: userToUpdate.email, // Using email as userId based on your backend
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        setShowPasswordModal(false)
        setShowSuccessModal(true)
      }
    } catch (err) {
      setPasswordUpdateError(err.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordUpdateLoading(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setUserToUpdate(null)
    setNewPassword("")
    setPasswordUpdateError(null)
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  // Pagination logic
  const totalPages = Math.ceil(registrations.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentRecords = registrations.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium inter-tight-400 ${
                currentPage === page
                  ? "bg-[#478DF5] text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoaderOverlay />
  }

  if (error) {
    return (
      <div className="h-auto">
        <div className="max-w-7xl mx-auto p-6 text-center text-red-500">Fout bij het ophalen van gegevens: {error}</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer style={{ zIndex: 10000000 }} />
      <div className="h-auto">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 inter-tight-600">Bevestig verwijdering</h2>
              <p className="mb-4 inter-tight-400">
                Weet u zeker dat u gebruiker <span className="font-semibold">{userToDelete?.naam}</span> (
                {userToDelete?.email}) wilt verwijderen?
              </p>
              {deleteError && <div className="text-red-500 inter-tight-400 mb-4">{deleteError}</div>}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-gray-300 inter-tight-400 text-sm cursor-pointer rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 text-white inter-tight-400 text-sm cursor-pointer rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteLoading ? "Verwijderen..." : "Verwijderen"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Update Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 inter-tight-600">Update Password</h2>
              <p className="mb-4 inter-tight-400">
                Updating password for <span className="font-semibold">{userToUpdate?.naam}</span> ({userToUpdate?.email})
              </p>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium  text-gray-700 mb-2 inter-tight-400">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border text-sm inter-tight-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#478DF5]"
                  placeholder="Enter new password"
                />
              </div>
              
              {passwordUpdateError && <div className="text-red-500 inter-tight-400 mb-4">{passwordUpdateError}</div>}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePasswordModal}
                  disabled={passwordUpdateLoading}
                  className="px-4 py-2 border border-gray-300 inter-tight-400 text-sm cursor-pointer rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passwordUpdateLoading}
                  className="px-4 py-2 bg-[#478DF5] text-white inter-tight-400 text-sm cursor-pointer rounded-md hover:bg-[#3a7bd5] disabled:opacity-50"
                >
                  {passwordUpdateLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 inter-tight-600">Success</h2>
              <p className="mb-4 inter-tight-400">
                Password has been successfully updated for <span className="font-semibold">{userToUpdate?.naam}</span> ({userToUpdate?.email})
              </p>
              <div className="flex justify-end">
                <button
                  onClick={closeSuccessModal}
                  className="px-4 py-2 bg-[#478DF5] text-white inter-tight-400 text-sm cursor-pointer rounded-md hover:bg-[#3a7bd5]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E4E9]">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-[#262F40] mb-1">Testgroep Aanmeldingen</h1>
              <p className="text-[#576175] inter-tight-400">Overzicht van alle testouder aanmeldingen en hun status</p>
            </div>

            <div className="overflow-y-auto custom-scrollbar max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Naam</th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Email</th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Leeftijd Kind</th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Aangemeld op</th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRecords.map((registration, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">{registration.naam}</td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">{registration.email}</td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">{registration.leeftijdKind}</td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-[#478DF5] text-white">
                          Actief
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">{registration.aangemeldOp}</td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteClick(registration)}
                            className="text-red-500 bg-slate-100 cursor-pointer p-2 rounded-lg hover:text-red-700 border border-[#E2E4E9]"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdatePasswordClick(registration)}
                            className="text-blue-500 bg-slate-100 cursor-pointer p-2 rounded-lg hover:text-blue-700 border border-[#E2E4E9]"
                          >
                            <Edit size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderPagination()}
          </div>
        </div>
      </div>
    </>
  )
}
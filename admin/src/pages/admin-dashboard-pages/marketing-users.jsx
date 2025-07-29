import { useState, useEffect } from "react"
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "../../utils/api"
import LoaderOverlay from "../../components/LoaderOverlay"
import { ToastContainer, toast } from "react-toastify"

export default function MarketingUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 6

  useEffect(() => {
    const fetchMarketingUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-all-guest-user`)

        if (response.data.getAllUsers) {
          const transformedData = response.data.getAllUsers.map((user) => ({
            id: user._id,
            email: user.email,
            marketingConsent: user.marketingConsent,
            createdAt: formatDate(user.createdAt),
          }))
          setUsers(transformedData)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketingUsers()
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

  const confirmDelete = async () => {
    if (!userToDelete) return
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.delete(`${BASE_URL}/delete-marketing-user/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success("Marketing user has been deleted")
        setUsers(users.filter((user) => user.id !== userToDelete.id))
        setShowDeleteModal(false)

        // Adjust current page if necessary after deletion
        const newTotalRecords = users.length - 1
        const newTotalPages = Math.ceil(newTotalRecords / recordsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete the marketing user")
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

  // Pagination logic
  const totalPages = Math.ceil(users.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentRecords = users.slice(startIndex, endIndex)

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
        <div className="max-w-7xl mx-auto p-6 text-center text-red-500">
          Fout bij het ophalen van gegevens: {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer style={{ zIndex: 10000000 }} />
      <div className="h-auto">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 inter-tight-600">
                Bevestig verwijdering
              </h2>
              <p className="mb-4 inter-tight-400">
                Weet u zeker dat u marketing gebruiker{" "}
                <span className="font-semibold">{userToDelete?.email}</span> wilt verwijderen?
              </p>
              {deleteError && (
                <div className="text-red-500 inter-tight-400 mb-4">{deleteError}</div>
              )}
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

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E4E9]">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-[#262F40] mb-1">
                Marketing Gebruikers
              </h1>
              <p className="text-[#576175] inter-tight-400">
                Overzicht van alle marketing gebruikers en hun gegevens
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">
                      Email
                    </th>
                    {/* <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">
                      Pagina Bezocht
                    </th> */}
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">
                      Marketing Toestemming
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-[#262F40] inter-tight-400">
                      Aangemeld op
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRecords.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        {user.email}
                      </td>
                     
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            user.marketingConsent
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.marketingConsent ? "Ja" : "Nee"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-[#478DF5] text-white">
                          Actief
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                        {user.createdAt}
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
import { useState, useEffect } from "react"
import { Search, ChevronDown, Download, Eye, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import useApi from "../../hooks/useApi"
import { saveAs } from "file-saver"
import * as Papa from "papaparse"
import { BASE_URL } from "../../utils/api"
import LoaderOverlay from "../../components/LoaderOverlay"

export default function GebruikersBeheren() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("Nieuwste eerst")
  const [statusFilter, setStatusFilter] = useState("Alle statussen")
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [userActivities, setUserActivities] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("list")
  const { fetchData, loading, error } = useApi()

  const usersPerPage = 6
  const sortOptions = ["Nieuwste eerst", "Oudste eerst", "Naam A-Z", "Naam Z-A"]
  const statusOptions = ["Alle statussen", "Active", "Trial", "Inactief"]

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const data = await fetchData(`${BASE_URL}/get-all-users`, token)
        if (data.success) {
          setUsers(data.users)
        }
      } catch (err) {
        console.error("Error fetching users:", err)
      }
    }
    fetchUsers()
  }, [])

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("authToken")
      const data = await fetchData(`${BASE_URL}/get-all-users-activities/${userId}`, token)
      if (data.success) {
        setUserDetails(data.user)
        setUserActivities(data.completedActivities)
      }
    } catch (err) {
      console.error("Error fetching user details:", err)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setActiveTab("details")
    fetchUserDetails(user.id)
  }

  const handleBackToList = () => {
    setActiveTab("list")
    setSelectedUser(null)
    setUserDetails(null)
    setUserActivities([])
  }

  const exportToCSV = () => {
    const dataToExport = users.map((user) => ({
      Email: user.email,
      Naam: user.username,
      Status: getUserStatus(user),
      Plan: user.subscriptionPlan,
      Aangemaakt: new Date(user.createdAt).toLocaleDateString("nl-NL"),
    }))
    const csv = Papa.unparse(dataToExport)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "gebruikers.csv")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL")
  }

  const getUserStatus = (user) => {
    if (user.isTestFamily) return "Trial"
    if (user.subscriptionPlan === "No plan yet") return "Inactief"
    return "Active"
  }

  const getStatusColor = (user) => {
    const status = getUserStatus(user)
    switch (status) {
      case "Trial":
        return "bg-[#B34DE6] text-white"
      case "Inactief":
        return "bg-gray-400 text-white"
      case "Active":
        return "bg-[#478DF5] text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const userStatus = getUserStatus(user)
    const matchesStatus = statusFilter === "Alle statussen" || statusFilter === userStatus
    return matchesSearch && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "Nieuwste eerst":
        return new Date(b.createdAt) - new Date(a.createdAt)
      case "Oudste eerst":
        return new Date(a.createdAt) - new Date(b.createdAt)
      case "Naam A-Z":
        return a.username.localeCompare(b.username)
      case "Naam Z-A":
        return b.username.localeCompare(a.username)
      default:
        return 0
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = sortedUsers.slice(startIndex, endIndex)

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
        {/* <div className="text-sm text-gray-700">
          Toont {startIndex + 1} tot {Math.min(endIndex, sortedUsers.length)} van {sortedUsers.length} resultaten
        </div> */}
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
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
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

  return (
    <div className="h-auto">
      <div className="max-w-7xl mx-auto">
        {activeTab === "list" && (
          <>
            <div className="border border-[#E2E4E9] mb-4 p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-xl text-black inter-tight-400 mb-2">Gebruikers Beheren</h1>
                  <p className="text-[#576175] inter-tight-400 text-md">
                    Zoek, filter, bewerk en exporteer alle gebruikersgegevens
                  </p>
                </div>
                <button
                  onClick={exportToCSV}
                  className="bg-[#16A34A] inter-tight-400 cursor-pointer text-white px-4 text-sm py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporteer CSV
                </button>
              </div>

              <div className="rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Zoek op naam of email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm outline-none rounded-lg bg-[#F7FAFC]"
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="w-full text-sm outline-none rounded-lg bg-[#F7FAFC] border border-gray-300 px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{sortBy}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full text-sm outline-none rounded-lg bg-[#F7FAFC] border border-gray-300 shadow-lg z-10">
                        {sortOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option)
                              setIsSortDropdownOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full text-sm outline-none bg-[#F7FAFC] border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{statusFilter}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isStatusDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full text-sm outline-none bg-[#F7FAFC] border border-gray-300 rounded-lg shadow-lg z-10">
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setStatusFilter(option)
                              setIsStatusDropdownOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full text-sm outline-none bg-[#F7FAFC] text-gray-700 border border-gray-300 rounded-lg px-4 py-2 flex justify-center items-center gap-2 text-center md:text-right">
                    <span className="font-medium">{filteredUsers.length}</span> resultaten
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#E2E4E9] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-medium text-gray-900 mb-1">Gebruikers Overzicht</h2>
                <p className="text-[#576175] text-sm inter-tight-400">
                  Volledige lijst met alle functies: bewerken, notities, abonnementsstatus aanpassen
                </p>
              </div>

              {loading ? (
                <LoaderOverlay />
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F9FAFB] inter-tight-400">
                        <tr>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Naam
                          </th>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Aangemaakt
                          </th>
                          <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">
                            Acties
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsers.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-4 py-1 text-xs font-medium rounded-full ${getStatusColor(user)}`}
                              >
                                {getUserStatus(user)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">
                              {user.subscriptionPlan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="inline-flex border-[#E2E4E9] border rounded-xl text-sm py-2 px-4 items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Bekijken
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination()}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "details" && selectedUser && (
          <div className="border border-[#E2E4E9] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#478DF5] to-[#5BA3F7] text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToList}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl inter-tight600 font-semibold mb-1">Gebruiker Details</h2>
                    <p className="text-blue-100 inter-tight-400 text-sm">Volledige informatie en activiteiten van {selectedUser.username}</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-8 bg-gray-50">
              {userDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* User Info Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#478DF5] to-[#5BA3F7] rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            {userDetails.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xl inter-tight-600 font-semibold text-gray-900">{userDetails.username}</h3>
                        <p className="text-gray-600 inter-tight-400 text-sm">{userDetails.email}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium inter-tight-400 text-sm">Account Type:</span>
                          <span className="text-gray-900 inter-tight-400 text-sm">
                            {userDetails.isTestFamily ? "Test Familie" : "Regulier"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium inter-tight-400 text-sm">Abonnement:</span>
                          <span className="text-gray-900 font-semibold inter-tight-400 text-sm">{selectedUser.subscriptionPlan}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium inter-tight-400 text-sm">Lid sinds:</span>
                          <span className="text-gray-900 inter-tight-400 text-sm">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600 font-medium inter-tight-400 text-sm">Status:</span>
                          <span
                            className={`inline-flex px-6 py-1  inter-tight-400 text-sm font-medium rounded-full ${getStatusColor(selectedUser)}`}
                          >
                            {getUserStatus(selectedUser)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities Card */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl inter-tight-400 font-semibold text-gray-900">Voltooide Activiteiten</h3>
                        <div className="bg-[#478DF5] text-white inter-tight-400 px-4 py-2 rounded-full text-sm font-medium">
                          {userActivities.length} activiteiten
                        </div>
                      </div>

                      {userActivities.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {userActivities.map((activity, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 inter-tight-600 text-md">{activity.title}</h4>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {/* <span className="font-medium text-gray-600">Leergebied:</span> */}
                                  <span className="bg-blue-100 text-blue-800 px-4 py-1 inter-tight-400 rounded-full text-xs font-medium">
                                    {activity.learningDomain}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 inter-tight-400">
                                  <span className="font-medium text-gray-600">Voltooid op:</span>
                                  <span className="text-gray-900">{formatDate(activity.completedAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 inter-tight-600 mb-2">Geen activiteiten gevonden</h4>
                          <p className="text-gray-600 inter-tight-400">Deze gebruiker heeft nog geen activiteiten voltooid.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <LoaderOverlay />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

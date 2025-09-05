import { useState, useEffect } from "react"
import { useRewardAPI } from "../../hooks/useRewardApi"

const Reward = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [rewardPoolInput, setRewardPoolInput] = useState("")
  const [currentRewardPool, setCurrentRewardPool] = useState(0)
  const [contributors, setContributors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState("")

  const contributorsPerPage = 10
  const { setRewardPool, getRewardPool, getTopContributors, loading } = useRewardAPI()

  useEffect(() => {
    loadRewardPool()
    loadTopContributors()
  }, [selectedMonth])

  const loadRewardPool = async () => {
    try {
      const data = await getRewardPool(selectedMonth)
      setCurrentRewardPool(data.rewardPool || 0)
      setRewardPoolInput(data.rewardPool || "")
    } catch (err) {
      console.error("Failed to load reward pool:", err)
    }
  }

  const loadTopContributors = async () => {
    try {
      const data = await getTopContributors(selectedMonth)
      setContributors(data.contributors || [])
      setCurrentPage(1) // Reset to first page when month changes
    } catch (err) {
      console.error("Failed to load contributors:", err)
    }
  }

  const handleSetRewardPool = async (e) => {
    e.preventDefault()
    if (!rewardPoolInput || isNaN(rewardPoolInput) || Number(rewardPoolInput) < 0) {
      return
    }

    try {
      await setRewardPool(selectedMonth, Number(rewardPoolInput))
      setCurrentRewardPool(Number(rewardPoolInput))
      setSuccessMessage("Reward pool updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      // Reload contributors to update estimated rewards
      loadTopContributors()
    } catch (err) {
      console.error("Failed to set reward pool:", err)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(contributors.length / contributorsPerPage)
  const startIndex = (currentPage - 1) * contributorsPerPage
  const endIndex = startIndex + contributorsPerPage
  const currentContributors = contributors.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-gray-900 poppins-700 mb-1">Manage Rewards & Contributors</h1>
          <p className="text-gray-400 inter-tight-400">Manage reward pools and view top contributors</p>
        </div>

        {/* Month Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 inter-tight-400">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto px-3 py-2 inter-tight-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Reward Pool Management */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-400">Reward Pool Management</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Pool Display */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1 inter-tight-400">Current Reward Pool</h3>
              <p className="text-2xl font-bold text-blue-900">${currentRewardPool.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">
                For{" "}
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Set New Pool */}
            <form onSubmit={handleSetRewardPool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inter-tight-400">Set New Reward Pool</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rewardPoolInput}
                  onChange={(e) => setRewardPoolInput(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 inter-tight-400 text-sm  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 inter-tight-400 px-4 rounded-xl cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Updating..." : "Update Reward Pool"}
              </button>
            </form>
          </div>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border inter-tight-400 text-sm border-green-400 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-600/20">
          <div className="p-6 border-b border-slate-300/40">
            <h2 className="text-xl  text-gray-900 inter-tight-600">Top Contributors</h2>
            <p className="text-sm text-gray-600 mt-1">
              {contributors.length} contributors found for{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading contributors...</p>
            </div>
          ) : contributors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contributors found for this month.</div>
          ) : (
            <>
              {/* Contributors List */}
              <div className="divide-y divide-gray-200">
                {currentContributors.map((contributor, index) => (
                  <div key={contributor.creator._id} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Creator Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {contributor.creator.profileImage ? (
                              <img
                                src={contributor.creator.profileImage || "/placeholder.svg"}
                                alt={contributor.creator.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-lg">
                                {contributor.creator.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{contributor.creator.name}</h3>
                          <p className="text-sm text-gray-500">Rank #{startIndex + index + 1}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-gray-500">Activities</p>
                          <p className="text-lg font-semibold text-gray-900">{contributor.activities.length}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-gray-500">Total Score</p>
                          <p className="text-lg font-semibold text-gray-900">{contributor.totalScore.toFixed(2)}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-gray-500">Avg Rating</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(
                              contributor.activities.reduce((sum, a) => sum + a.avgRating, 0) /
                              contributor.activities.length
                            ).toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-gray-500">Est. Reward</p>
                          <p className="text-lg font-semibold text-green-600">
                            ${contributor.estimatedReward.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activities Details */}
                    <div className="mt-4 pl-0 lg:pl-16">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Top Activities:</h4>
                      <div className="space-y-2">
                        {contributor.activities.map((activity) => (
                          <div
                            key={activity.activityId}
                            className="flex flex-col sm:flex-row sm:justify-between bg-gray-50 rounded-md p-3"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                              <p className="text-xs text-gray-500">
                                {activity.executions} executions • {activity.avgRating.toFixed(1)} rating
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <p className="text-sm font-medium text-gray-900">Score: {activity.score.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, contributors.length)} of {contributors.length}{" "}
                      contributors
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex space-x-1">
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
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reward

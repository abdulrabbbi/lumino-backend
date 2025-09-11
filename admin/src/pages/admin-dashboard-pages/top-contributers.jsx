import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useRewardAPI } from "../../hooks/useRewardApi"

const TopContributors = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [data, setData] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [activeTab, setActiveTab] = useState("contributors") // "contributors" or "leaderboard"
  const [loading, setLoading] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [error, setError] = useState(null)

  const { getTopContributors, getTopActivitiesLeaderboard } = useRewardAPI()

  useEffect(() => {
    if (activeTab === "contributors") {
      loadTopContributors()
    } else if (activeTab === "leaderboard") {
      loadLeaderboard()
    }
  }, [selectedMonth, activeTab])

  const loadTopContributors = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getTopContributors(selectedMonth)
      setData(response.data)
    } catch (err) {
      setError(err.message)
      console.error("Failed to load top contributors:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true)
    setError(null)
    try {
      const response = await getTopActivitiesLeaderboard(selectedMonth)
      setLeaderboardData(response.data)
    } catch (err) {
      setError(err.message)
      console.error("Failed to load leaderboard:", err)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') return amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-4 px-6 text-lg font-medium border-b-2 text-sm transition-colors duration-200 ${
                activeTab === "contributors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("contributors")}
            >
              Top Contributors
            </button>
            <button
              className={`py-4 px-6 text-lg font-medium border-b-2 text-sm transition-colors duration-200 ${
                activeTab === "leaderboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              System Activities Leaderboard
            </button>
          </div>
        </div>

        {/* Header Section with Dynamic Title and Description */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-gray-900 poppins-700 mb-1">
              {activeTab === "contributors" ? "Top Contributors" : "System Activities Leaderboard"}
            </h1>
            <p className="text-gray-400 inter-tight-400">
              {activeTab === "contributors" 
                ? "View top contributors and their activities" 
                : "View top activities including system activities"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-xl inter-tight-400 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
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

        {/* Content based on active tab */}
        {activeTab === "contributors" ? (
          <>
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading data...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <p className="text-red-600">Error: {error}</p>
                <button
                  onClick={loadTopContributors}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : !data || (data.summary.qualifyingActivitiesCount === 0 && data.topCreators.length === 0) ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mt-4 inter-tight-400">No Data Found</h3>
                <p className="text-gray-500 inter-tight-400 mt-1">
                  No contributor data available for{" "}
                  {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
                    <h3 className="text-sm font-medium text-blue-800 mb-1 inter-tight-400">Qualifying Activities</h3>
                    <p className="text-2xl font-bold text-blue-900">{data.summary.qualifyingActivitiesCount}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
                    <h3 className="text-sm font-medium text-blue-800 mb-1 inter-tight-400">Total Creators</h3>
                    <p className="text-2xl font-bold text-blue-900">{data.summary.totalCreatorsEarning}</p>
                  </div>
                </div>

                {/* Top Creators Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 mb-8">
                  <div className="p-6 border-b border-slate-300/40">
                    <h2 className="text-xl text-gray-900 inter-tight-600">Top Creators</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {data.topCreators.length} creators earning rewards
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Creator
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qualifying Activities
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estimated Earnings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.topCreators.map((creator) => (
                          <tr key={creator.creatorId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {creator.creatorName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{creator.creatorName}</div>
                                  <div className="text-sm text-gray-500">ID: {creator.creatorId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {creator.qualifyingActivitiesCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {creator.totalScore.toFixed(2)}
                            </td>
                            {typeof creator.estimatedEarnings === 'number' ? (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(creator.estimatedEarnings)}
                              </td>
                            ) : (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {creator.estimatedEarnings}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Activities Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-600/20">
                  <div className="p-6 border-b border-slate-300/40">
                    <h2 className="text-xl text-gray-900 inter-tight-600">Top Activities</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {data.qualifyingActivities.length} activities contributing to rewards
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Creator
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Executions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average Rating
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.qualifyingActivities.map((activity) => (
                          <tr key={activity.activityId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{activity.activityName}</div>
                              <div className="text-sm text-gray-500">ID: {activity.activityId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{activity.creatorName}</div>
                              <div className="text-sm text-gray-500">ID: {activity.creatorId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.executions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.averageRating.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.score.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {leaderboardLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading leaderboard data...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <p className="text-red-600">Error: {error}</p>
                <button
                  onClick={loadLeaderboard}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : !leaderboardData || leaderboardData.topActivities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mt-4 inter-tight-400">No Leaderboard Data Found</h3>
                <p className="text-gray-500 inter-tight-400 mt-1">
                  No leaderboard data available for{" "}
                  {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <>
                {/* Leaderboard Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
                    <h3 className="text-sm font-medium text-purple-800 mb-1 inter-tight-400">Total Activities</h3>
                    <p className="text-2xl font-bold text-purple-900">{leaderboardData.topActivities.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
                    <h3 className="text-sm font-medium text-purple-800 mb-1 inter-tight-400">System Activities</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {leaderboardData.topActivities.filter(a => a.creatorType === 'system').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
                    <h3 className="text-sm font-medium text-purple-800 mb-1 inter-tight-400">User Activities</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {leaderboardData.topActivities.filter(a => a.creatorType === 'user').length}
                    </p>
                  </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-600/20">
                  <div className="p-6 border-b border-slate-300/40">
                    <h2 className="text-xl text-gray-900 inter-tight-600">System Activities Leaderboard</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {leaderboardData.topActivities.length} top activities (including system activities)
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Creator
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Executions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average Rating
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboardData.topActivities.map((activity, index) => (
                          <tr key={activity.activityId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{activity.activityName}</div>
                              <div className="text-sm text-gray-500">ID: {activity.activityId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{activity.creatorName}</div>
                              <div className="text-sm text-gray-500">ID: {activity.creatorId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                activity.creatorType === 'system' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {activity.creatorType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.executions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.averageRating.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {activity.score.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TopContributors
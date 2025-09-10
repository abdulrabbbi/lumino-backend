import { useState, useEffect } from "react"
import { useRewardAPI } from "../../hooks/useRewardApi"
import { useNavigate } from "react-router-dom"

const Reward = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [rewardPoolInput, setRewardPoolInput] = useState("")
  const [currentRewardPool, setCurrentRewardPool] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  const { setRewardPool, getRewardPool, loading } = useRewardAPI()

  useEffect(() => {
    loadRewardPool()
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
    } catch (err) {
      console.error("Failed to set reward pool:", err)
    }
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 poppins-700 mb-1">Manage Rewards</h1>
            <p className="text-gray-400 inter-tight-400">Set and manage monthly reward pools</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard/top-contributors")}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-sm inter-tight-400 text-white py-2 px-4 rounded-xl inter-tight-400 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            View Top Contributors
          </button>
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-600/20 p-6">
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
      </div>
    </div>
  )
}

export default Reward
import { useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "../utils/api"

export default function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${BASE_URL}/get-platform-stats`, {})
        setStats(res.data)
      } catch (err) {
        setError(err.message || "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

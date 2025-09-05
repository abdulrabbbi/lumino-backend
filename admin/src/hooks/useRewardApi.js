import { useState } from "react"
import { BASE_URL } from "../utils/api"
export const useRewardAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setRewardPool = async (month, rewardPool) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/set-reward-pool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, rewardPool }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getRewardPool = async (month) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/get-reward-pool?month=${month}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTopContributors = async (month) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/get-top-contributors?month=${month}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    setRewardPool,
    getRewardPool,
    getTopContributors,
    loading,
    error,
  }
}

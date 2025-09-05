import { useState, useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/api'

export default function useChildSettings() {
  const [ageGroup, setAgeGroup] = useState(null) 
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAgeGroup = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${BASE_URL}/get-child-setting`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data?.ageGroup) {
          setAgeGroup(response.data.ageGroup) 
        } else {
          setAgeGroup('3 - 4') 
        }
      } catch (error) {
        console.error('Failed to fetch child setting:', error)
        setAgeGroup('3 - 4')
      } finally {
        setLoading(false)
      }
    }

    fetchAgeGroup()
  }, [])

  const updateAgeGroup = async (newAgeGroup) => {
    setLoading(true)
    setAgeGroup(newAgeGroup)

    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
        `${BASE_URL}/update-child-setting`,
        { ageGroup: newAgeGroup },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('Child setting updated successfully')
    } catch (error) {
      console.error('Failed to update child setting:', error)
    } finally {
      setLoading(false)
    }
  }

  return { ageGroup, loading, updateAgeGroup }
}
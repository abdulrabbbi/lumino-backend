import { useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/api'

export default function useChildSettings() {
  const [ageGroup, setAgeGroup] = useState('Age 3 - 4')
  const [loading, setLoading] = useState(false)

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

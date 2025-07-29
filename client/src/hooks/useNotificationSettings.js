import { useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/api'

export default function useNotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [weeklyProgressReport, setWeeklyProgressReport] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateSettings = async (newEmail, newWeekly) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
           `${BASE_URL}/update-notification-settings` ,
        {
          notificationsEnabled: newEmail,
          weeklyProgressEnabled: newWeekly
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEmailNotifications(newEmail)
      setWeeklyProgressReport(newWeekly)
    } catch (err) {
      console.error('Failed to update notification settings:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    emailNotifications,
    setEmailNotifications,
    weeklyProgressReport,
    setWeeklyProgressReport,
    loading,
    updateSettings
  }
}

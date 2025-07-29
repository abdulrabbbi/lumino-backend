import useNotificationSettings from "../hooks/useNotificationSettings"

export default function NotificationSettings() {
  const {
    emailNotifications,
    weeklyProgressReport,
    loading,
    updateSettings
  } = useNotificationSettings()

  return (
    <div className="h-full bg-[#FFFFFF] flex items-center justify-center relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
        <h1 className="text-xl text-gray-900 inter-tight-400 mb-8">Notification Settings</h1>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <h3 className="text-base font-medium text-[#000000] inter-tight-400 mb-1">Email Notifications</h3>
              <p className="text-sm text-gray-500 mt-1 inter-tight-400">Receive Activity Reminders And Updates Via Email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-6">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={emailNotifications}
                onChange={() => {
                  updateSettings(!emailNotifications, weeklyProgressReport)
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <hr className="border-gray-200" />

          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <h3 className="text-base text-[#000000] mb-1 inter-tight-400">Weekly Progress Report</h3>
              <p className="text-sm text-gray-500 mt-1 inter-tight-400">Receive A Weekly Summary Of Your Child's Progress</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-6">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={weeklyProgressReport}
                onChange={() => {
                  updateSettings(emailNotifications, !weeklyProgressReport)
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

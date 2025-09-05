import { useState } from "react"
import { ChevronDown } from "lucide-react"
import useChildSettings from "../hooks/useChildSettings"
import LoaderOverlay from "../components/LoaderOverlay"

export default function Preferences() {
  const [darkMode, setDarkMode] = useState(false)
  const { ageGroup, loading, updateAgeGroup } = useChildSettings()

  return (
    <div className="h-full bg-[#FFFFFF] space-y-6 relative">
      {loading && (
        <LoaderOverlay/>
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
          <h2 className="text-xl text-gray-950 mb-6 inter-tight-400">Child Setting</h2>

          <div className="space-y-2">
            <label htmlFor="age-group" className="block text-sm text-[#6B7280] inter-tight-400">
              Age Group
            </label>
            <div className="relative">
              <select
                id="age-group"
                value={ageGroup || ''}
                onChange={(e) => updateAgeGroup(e.target.value)}
                className="w-full bg-[#F7FAFC] border border-gray-300 rounded-md py-2 px-3 text-left outline-none text-sm text-[#575757]"
                disabled={loading} 
              >
                <option value="" disabled>Select Age Group</option>
                <option value="3 - 4">Age 3 - 4</option>
                <option value="3 - 6">Age 3 - 6</option>
                <option value="5 - 6">Age 5 - 6</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1 inter-tight-400">
              This Setting Determines Which Activities Are Recommended For Your Child
            </p>
          </div>
        </div>


        <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
          <h2 className="text-xl text-gray-950 mb-6 inter-tight-400">Application Preferences</h2>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm inter-tight-400 text-[#000000]">Dark Mode</h3>
                <p className="text-sm text-gray-500 inter-tight-400 mt-1">Switch Between Light & Dark Theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-[#000000] inter-tight-400">Language</h3>
                <p className="text-sm text-gray-500 inter-tight-400 mt-1">Choose Your Preferred Language</p>
              </div>
              <div className="relative w-32">
                <button
                  type="button"
                  className="w-full bg-white border border-gray-300 text-sm rounded-md py-2 px-3 text-left "
                  aria-haspopup="listbox"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[#575757]">English</span>
                    <ChevronDown className="h-4 w-4 text-[#575757]" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

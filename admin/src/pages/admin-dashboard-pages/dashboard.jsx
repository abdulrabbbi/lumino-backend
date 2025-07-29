import { Users, TrendingUp, Activity, Calendar, DollarSign } from "lucide-react"
import useDashboardStats from "../../hooks/useDashboardStats"
import LoaderOverlay from "../../components/LoaderOverlay"

export default function Dashboard() {
  const { stats, loading, error } = useDashboardStats()
  
  if (loading) {
    return <LoaderOverlay />
  }
  return (
    <div className="h-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-700 font-medium text-lg inter-tight-400">Totaal Abonnees</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-blue-900">
              {loading ? <LoaderOverlay /> : stats?.totalSubscribers ?? 0}
            </span>
          </div>
          <p className="text-blue-600 text-sm inter-tight-400">van alle gebruikers</p>
        </div>

        <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-700 font-medium text-lg inter-tight-400">Gemiddeld Activiteiten</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-green-900">
              {loading ? <LoaderOverlay /> : stats?.avgActivitiesPerUser ?? 0}
            </span>
          </div>
          <p className="text-green-600 text-sm inter-tight-400">per gebruiker</p>
        </div>

        <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-purple-700 font-medium text-lg inter-tight-400">Voltooide Activiteiten</h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-purple-900">
              {loading ? <LoaderOverlay /> : stats?.completedActivities ?? 0}
            </span>
          </div>
          <p className="text-purple-600 text-sm inter-tight-400">totaal platform</p>
        </div>

        <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-orange-700 font-medium text-lg inter-tight-400">Nieuwe Abonnees</h3>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-orange-900">
              {loading ? <LoaderOverlay /> : stats?.newSubscribersLast30Days ?? 0}
            </span>
          </div>
          <p className="text-orange-600 text-sm inter-tight-400">laatste 30 dagen</p>
        </div>

        <div className="bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-teal-700 font-medium text-lg inter-tight-400">Customer Life Time Value</h3>
            <DollarSign className="w-6 h-6 text-teal-600" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-teal-900">
              {loading ? <LoaderOverlay /> : stats?.customerLifetimeValue ?? "€0"}
            </span>
          </div>
          <p className="text-teal-600 text-sm inter-tight-400">gemiddelde waarde</p>
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}

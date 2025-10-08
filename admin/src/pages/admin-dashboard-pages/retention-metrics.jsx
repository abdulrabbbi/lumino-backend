import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BASE_URL } from '../../utils/api';
import LoaderOverlay from '../../components/LoaderOverlay';
const  RetentionDashboard = () => {
  const [cohortType, setCohortType] = useState('weekly');
  const [dateRange, setDateRange] = useState('90');
  const [segmentBy, setSegmentBy] = useState('');
  const [retentionData, setRetentionData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('retention');

  useEffect(() => {
    fetchAllAnalytics();
  }, [cohortType, dateRange, segmentBy]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        cohortType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (segmentBy) params.append('segmentBy', segmentBy);

      const [retentionRes, engagementRes, churnRes] = await Promise.all([
        fetch(`${BASE_URL}/retention-cohorts?${params}`),
        fetch(`${BASE_URL}/engagement-metrics?${params}`),
        fetch(`${BASE_URL}/churn-analysis?daysInactive=14`)
      ]);

      const retention = await retentionRes.json();
      const engagement = await engagementRes.json();
      const churn = await churnRes.json();

      setRetentionData(retention);
      setEngagementData(engagement);
      setChurnData(churn);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareRetentionChartData = () => {
    if (!retentionData?.cohorts) return [];

    const maxPeriods = Math.max(...retentionData.cohorts.map(c => c.retention.length));
    const chartData = [];

    for (let i = 0; i < maxPeriods; i++) {
      const dataPoint = { period: `Period ${i}` };
      
      retentionData.cohorts.forEach((cohort, index) => {
        if (cohort.retention[i]) {
          dataPoint[`Cohort ${index + 1}`] = cohort.retention[i].retentionRate;
        }
      });

      chartData.push(dataPoint);
    }

    return chartData;
  };

  const prepareEngagementChartData = () => {
    if (!engagementData?.metrics?.activitiesByCategory) return [];
    
    return engagementData.metrics.activitiesByCategory.map(cat => ({
      name: cat.category,
      count: cat.count
    }));
  };

  if (loading) {
    return (
    <LoaderOverlay/>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="flex justify-between items-center w-full  mb-8">
          <h1 className="text-2xl poppins-700 text-gray-900 ">Retention Analytics</h1>
           {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              const data = activeTab === 'retention' ? retentionData : 
                           activeTab === 'engagement' ? engagementData : churnData;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeTab}-analytics-${new Date().toISOString()}.json`;
              a.click();
            }}
            className="px-6 py-2 text-sm inter-tight-400 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export Data
          </button>
        </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block  text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                Cohort Type
              </label>
              <select
                value={cohortType}
                onChange={(e) => setCohortType(e.target.value)}
                className="w-full px-4 py-2 border text-sm inter-tight-400  border-gray-300 rounded-lg outline-none "
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block  text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border text-sm inter-tight-400 border-gray-300 rounded-lg outline-none"
              >
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm  inter-tight-400 font-medium text-gray-700 mb-2">
                Segment By
              </label>
              <select
                value={segmentBy}
                onChange={(e) => setSegmentBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-sm inter-tight-400 rounded-lg outline-none"
              >
                <option value="">None</option>
                <option value="ageGroup">Age Group</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg text-sm inter-tight-400 shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('retention')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'retention'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Retention Cohorts
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'engagement'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Engagement Metrics
            </button>
            <button
              onClick={() => setActiveTab('churn')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'churn'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Churn Analysis
            </button>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-md p-6">
          {activeTab === 'retention' && (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 inter-tight-400 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Cohorts</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {retentionData?.summary?.totalCohorts || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {retentionData?.summary?.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Week 1 Retention</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {retentionData?.summary?.averageRetentionByPeriod?.[1]?.averageRetentionRate || 0}%
                  </p>
                </div>
              </div>

              {/* Retention Chart */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 inter-tight-700">Retention Curve</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prepareRetentionChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {retentionData?.cohorts?.map((cohort, index) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey={`Cohort ${index + 1}`}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Cohort Details Table */}
              <div>
                <h3 className="text-xl font-semibold mb-4 inter-tight-700">Cohort Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full inter-tight-400 divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cohort
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Week 0
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Week 1
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Week 2
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Week 3
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Week 4
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {retentionData?.cohorts?.map((cohort, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cohort.cohortName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cohort.totalUsers}
                          </td>
                          {[0, 1, 2, 3, 4].map(period => (
                            <td key={period} className="px-6 py-4 whitespace-nowrap text-sm">
                              {cohort.retention[period] ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cohort.retention[period].retentionRate >= 50
                                    ? 'bg-green-100 text-green-800'
                                    : cohort.retention[period].retentionRate >= 30
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {cohort.retention[period].retentionRate}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Segmented Data */}
              {segmentBy && retentionData?.segmentedData && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Retention by {segmentBy === 'ageGroup' ? 'Age Group' : segmentBy}
                  </h3>
                  {retentionData.segmentedData.map((segment, idx) => (
                    <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-lg mb-2">
                        {segment.segment} ({segment.totalUsers} users)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {segment.cohorts.slice(0, 4).map((cohort, cIdx) => (
                          <div key={cIdx} className="bg-white p-3 rounded shadow-sm">
                            <p className="text-xs text-gray-600">{cohort.cohortName}</p>
                            <p className="text-sm font-semibold">
                              {cohort.retention[1]?.retentionRate || 0}% (Week 1)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'engagement' && (
            <div>
              {/* Engagement Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 inter-tight-400 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {engagementData?.metrics?.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {engagementData?.metrics?.activeUsers || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {engagementData?.metrics?.engagementRate || 0}%
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Activities/User</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {engagementData?.metrics?.avgActivitiesPerUser || 0}
                  </p>
                </div>
              </div>

              {/* Activities by Category Chart */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 inter-tight-700">Activities by Learning Domain</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={prepareEngagementChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Activities by Age Group */}
              <div>
                <h3 className="text-xl font-semibold mb-4 inter-tight-700">Engagement by Age Group</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full inter-tight-400 divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Age Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Activities
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Avg/User
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {engagementData?.metrics?.activitiesByAgeGroup?.map((age, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {age.ageGroup}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {age.users}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {age.totalActivities}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {age.avgActivitiesPerUser}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'churn' && (
            <div>
              {/* Churn Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 inter-tight-400 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {churnData?.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Churned Users</p>
                  <p className="text-3xl font-bold text-red-600">
                    {churnData?.totalChurned || 0}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {churnData?.churnRate || 0}%
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Never Active</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {churnData?.segments?.neverActive?.count || 0}
                  </p>
                </div>
              </div>

              {/* Churn Segments */}
              <div className="grid grid-cols-1 inter-tight-400 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2 text-yellow-800">
                    Never Active
                  </h4>
                  <p className="text-3xl font-bold text-yellow-600 mb-2">
                    {churnData?.segments?.neverActive?.count || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Users who signed up but never completed an activity
                  </p>
                </div>

                <div className="bg-orange-50 inter-tight-400 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-2 text-orange-800">
                    Recently Churned
                  </h4>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    {churnData?.segments?.recentlyChurned?.count || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Inactive for 14-30 days (still recoverable)
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-2 text-red-800">
                    Long-term Churned
                  </h4>
                  <p className="text-3xl font-bold text-red-600 mb-2">
                    {churnData?.segments?.longTermChurned?.count || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Inactive for more than 30 days
                  </p>
                </div>
              </div>

              {/* Churned Users Details */}
              <div>
                <h3 className="text-xl font-semibold inter-tight-700 mb-4">Recently Churned Users</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full inter-tight-400 divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Days Inactive
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Activities Done
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {churnData?.segments?.recentlyChurned?.users?.slice(0, 10).map((user, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActivityDate 
                              ? new Date(user.lastActivityDate).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.daysInactive > 30
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {user.daysInactive} days
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.totalActivitiesCompleted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
}

export default RetentionDashboard
import React from 'react';
import { useConversionFunnel } from '../../hooks/usefunnelConversion';
import LoaderOverlay from '../../components/LoaderOverlay';

const ConversionFunnel = () => {
  const { funnelData, loading, error, fetchFunnelData } = useConversionFunnel();

  const getConversionRateColor = (rate) => {
    const numericRate = parseFloat(rate);
    if (numericRate >= 80) return 'text-green-800 bg-green-100 border-green-200';
    if (numericRate >= 50) return 'text-yellow-800 bg-yellow-100 border-yellow-200';
    return 'text-red-800 bg-red-100 border-red-200';
  };

  const calculateDropOff = (currentStep, previousStep) => {
    if (previousStep === 0) return '0%';
    const dropOff = ((previousStep - currentStep) / previousStep * 100).toFixed(1);
    return `${dropOff}%`;
  };

  if (loading) {
    return (
     <LoaderOverlay/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFunnelData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
            <p className="text-yellow-600 mb-4">No conversion funnel data found. Please check back later.</p>
            <button
              onClick={fetchFunnelData}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto w-full ">
        <div className="text-left mb-12">
          <h1 className="text-2xl font-bold inter-tight-700 text-gray-900 mb-3">
            Conversion Funnel Analytics
          </h1>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{funnelData.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Final Conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {funnelData.funnel[funnelData.funnel.length - 1].conversionRate}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-xl">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Steps</p>
                <p className="text-2xl font-bold text-gray-900">{funnelData.funnel.length}</p>
              </div>
            </div>
          </div>
        </div>



        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold inter-tight-700 text-gray-800">Funnel Overview</h2>
          </div>
          <div className="overflow-x-auto inter-tight-400">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm inter-tight-400 text-gray-700   tracking-wider">
                    Step
                  </th>
                  <th className="px-8 py-4 text-left text-sm inter-tight-400 text-gray-700   tracking-wider">
                    Description
                  </th>
                  <th className="px-8 py-4 text-left text-sm inter-tight-400 text-gray-700   tracking-wider">
                    Users
                  </th>
                  <th className="px-8 py-4 text-left text-sm inter-tight-400 text-gray-700   tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-8- py-4 text-left text-sm inter-tight-400 text-gray-700      tracking-wider">
                    Drop-off
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funnelData.funnel.map((step, index) => (
                  <tr key={step.step} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                          {step.step}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                      {step.description}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-900 font-semibold">
                      {step.count.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getConversionRateColor(step.conversionRate)}`}>
                        {step.conversionRate}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-900 font-medium">
                      {index === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full">
                          {calculateDropOff(step.count, funnelData.funnel[index - 1].count)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={fetchFunnelData}
            className="inline-flex inter-tight-400 items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analytics Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;
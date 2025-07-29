import React from 'react';
import { Mail } from 'lucide-react';

export default function EarlyAccessPage() {
  const earlyAccessUsers = [
    {
      email: "mfbeukers@gmail.com",
      registeredDate: "29 mei 2025 om 13:29",
      status: "Geïnteresseerd"
    },
    {
      email: "test@earlyaccess.com",
      registeredDate: "28 mei 2025 om 00:10",
      status: "Geïnteresseerd"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto ">
      <div className="bg-white  rounded-lg">
        <div className="p-4 border border-[#E2E4E9] rounded-xl">
          <h1 className="text-2xl font-semibold text-gray-900">Early Access</h1>
        </div>
        
        <div className="overflow-x-auto mt-4 border border-[#E2E4E9] rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-MAILADRES
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AANGEMELD OP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earlyAccessUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.registeredDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
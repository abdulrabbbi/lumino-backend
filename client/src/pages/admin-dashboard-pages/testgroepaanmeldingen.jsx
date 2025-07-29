import React from 'react';
import { Trash2 } from 'lucide-react';

export default function TestgroepAanmeldingen() {
  const registrations = [
    {
      naam: "edde de",
      email: "eedde@ded.nl",
      leeftijdKind: "5 jaar",
      ervaring: {
        onderwijs: true,
        coaching: true,
        opvoeding: true
      },
      aangemeldOp: "27-05-2025, 18:54"
    },
    {
      naam: "Floris Beukers",
      email: "dde@wded.nl",
      leeftijdKind: "5 jaar",
      ervaring: {
        onderwijs: true,
        coaching: true,
        opvoeding: true
      },
      aangemeldOp: "27-05-2025, 18:52"
    }
  ];

  return (
    <div className="h-auto">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E4E9]">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-[#262F40] mb-1">
            Testgroep Aanmeldingen  
            </h1>
            <p className="text-[#576175] inter-tight-400">
            Overzicht van alle testouder aanmeldingen en hun status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Leeftijd Kind
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Ervaring
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Aangemeld op
                  </th>
                  <th className="px-6 py-3 text-left text-sm  text-[#262F40] inter-tight-400">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((registration, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      {registration.naam}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      {registration.leeftijdKind}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">Onderwijs:</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Coaching:</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Opvoeding:</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      {registration.aangemeldOp}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#262F40] inter-tight-400">
                      <button className="text-red-500 bg-slate-100 cursor-pointer p-2 rounded-lg hover:text-red-700 border border-[#E2E4E9]">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
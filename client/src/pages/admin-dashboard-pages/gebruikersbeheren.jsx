import React, { useState } from 'react';
import { Search, ChevronDown, Download, Edit } from 'lucide-react';

export default function GebruikersBeheren() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Nieuwste eerst');
  const [statusFilter, setStatusFilter] = useState('Alle statussen');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const sortOptions = ['Nieuwste eerst', 'Oudste eerst', 'Naam A-Z', 'Naam Z-A'];
  const statusOptions = ['Alle statussen', 'Active', 'Trial', 'Inactief'];

  const users = [
    {
      email: 'test@example.com',
      name: 'Test Gebruiker',
      status: 'active',
      plan: 'monthly',
      date: '4-6-2025'
    },
    {
      email: 'demo@luumilo.nl',
      name: 'Demo Familie',
      status: 'trial',
      plan: 'yearly',
      date: '28-5-2025'
    }
  ];

  return (
    <div className="h-auto">
      <div className="max-w-7xl mx-auto">
        <div className='border border-[#E2E4E9] mb-4 p-4 rounded-xl'>

        <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0 ">
            <h1 className="text-xl  text-black inter-tight-400 mb-2">Gebruikers Beheren</h1>
            <p className="text-[#576175] inter-tight-400 text-md">Zoek, filter, bewerk en exporteer alle gebruikersgegevens</p>
          </div>
          <button className="bg-[#16A34A] inter-tight-400 cursor-pointer text-white px-4 text-sm py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Exporteer CSV
          </button>
        </div>
      

        <div className=" rounded-lg ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek op naam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  text-sm outline-none  rounded-lg bg-[#F7FAFC]"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="w-full text-sm outline-none  rounded-lg bg-[#F7FAFC] border border-gray-300 px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">{sortBy}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full text-sm outline-none  rounded-lg bg-[#F7FAFC] border border-gray-300 shadow-lg z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full text-sm outline-none  bg-[#F7FAFC] border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">{statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full text-sm outline-none  bg-[#F7FAFC] border border-gray-300 rounded-lg shadow-lg z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full text-sm outline-none  bg-[#F7FAFC] text-gray-700 border border-gray-300 rounded-lg px-4 py-2 flex justify-center items-center gap-2 text-center md:text-right">
              <span className="font-medium">2</span> resultaten
            </div>
          </div>
        </div>
        </div>

        <div className=" border border-[#E2E4E9] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900 mb-1">Gebruikers Overzicht</h2>
            <p className="text-[#576175] text-sm inter-tight-400">Volledige lijst met alle functies: bewerken, notities, abonnementsstatus aanpassen</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] inter-tight-400">
                <tr>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Naam</th>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Aangemaakt</th>
                  <th className="px-6 py-3 text-left md:text-sm text-xs font-medium text-[#262F40] tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-4 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' 
                          ? 'bg-[#478DF5] text-white' 
                          : 'bg-[#B34DE6] text-white'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#262F40]">{user.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="inline-flex border-[#E2E4E9] border rounded-xl text-sm  py-2 px-6 items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit className="w-4 h-4" />
                        Bewerken
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
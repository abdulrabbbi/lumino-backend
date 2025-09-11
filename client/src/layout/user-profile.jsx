// UserProfileLayout.jsx
/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/user-profile-sidebar';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext';

const UserProfileLayout = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col md:mt-[5%] mt-5 pb-10">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className='poppins-700 text-3xl'>Profile Settings</h1>
          <button
  onClick={toggleSidebar}
  className="block md:block lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
  aria-label="Toggle sidebar"
>
  {isSidebarOpen ? (
    <FiX className="w-6 h-6 text-gray-700" />
  ) : (
    <FiMenu className="w-6 h-6 text-gray-700" />
  )}
</button>

        </div>
      
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-300px)] relative">
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}
          
          <Sidebar />
          <main className="flex-1 h-full overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;
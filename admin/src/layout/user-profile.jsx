/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/user-profile-sidebar';

const UserProfileLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:mt-[5%] mt-5  pb-10">
    <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div>
           <h1 className='poppins-700 text-3xl mb-10'> Profile Settings</h1>
        </div>
      
      <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-300px)]">
        <Sidebar />
        <main className="flex-1 h-full  overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
  );
};

export default UserProfileLayout
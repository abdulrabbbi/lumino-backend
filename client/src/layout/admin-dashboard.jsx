/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin-dashboard/sidebar';

const AdminDashboardLayout = () => {
    return (
        <div className="min-h-screen flex flex-col md:mt-[3%]  md:px-0 pb-10">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className='mb-10'>
                    <h1 className='poppins-700 text-3xl '> Luumilo Admin Dashboard</h1>
                    <p className='inter-tight-400 text-[#4B5563] text-md mt-2'>Volledige controle over gebruikers, statistieken en platform beheer</p>
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

export default AdminDashboardLayout
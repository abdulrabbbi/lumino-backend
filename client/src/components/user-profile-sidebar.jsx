// user-profile-sidebar.jsx (Updated with overlay)
/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import { FiUser, FiBell, FiSettings, FiUserCheck } from "react-icons/fi";
import { MdSubscriptions } from "react-icons/md";
import { Badge, X } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar, setIsSidebarOpen } = useSidebar();

  const links = [
    { to: "/user-profile/profile", label: "Profiel", icon: <FiUser className="mr-2" /> },
    { to: "/user-profile/subscription", label: "Abonnement", icon: <MdSubscriptions className="mr-2" /> },
    { to: "/user-profile/preferences", label: "Voorkeuren", icon: <FiSettings className="mr-2" /> },
    { to: "/user-profile/notifications", label: "Meldingen", icon: <FiBell className="mr-2" /> },
    { to: "/user-profile/refer-a-friend", label: "Vriend doorverwijzen", icon: <FiUserCheck className="mr-2" /> },
    { to: "/user-profile/earn-a-badge", label: "Verdiende mijlpalen", icon: <Badge className="mr-2" /> },
  ];

  return (
    <>
      {/* Overlay for small & medium screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform lg:z-50  z-[10000000] transition-transform duration-500 lg:translate-x-0 lg:relative md:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        <div className="flex justify-end md:hidden p-4">
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-full">


          {/* Navigation links */}
          <div className="flex-1 py-4 lg:py-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar} // Close sidebar when link is clicked on mobile
                className={({ isActive }) =>
                  `p-4 flex items-center cursor-pointer inter-tight-400 transition-colors ${isActive
                    ? "bg-[#F1F6FB] text-[#2563EB]"
                    : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;


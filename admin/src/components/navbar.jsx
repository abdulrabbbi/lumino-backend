import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { jwtDecode } from "jwt-decode";


import NavImage from "../../public/nav-images/Luumilo_Logo_RGB-1.png";
import { useSidebar } from "../context/SidebarContext";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { setIsOpen } = useSidebar(); // sidebar toggle function

  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
      try {
        jwtDecode(token);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to decode token", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    setIsLoggedIn(false);
    window.location.href = "/admin/signin";
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav className="sticky top-0 z-[10000] bg-white p-2 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <img
              src={NavImage}
              alt="Logo"
              className="h-20 w-auto"
              loading="eager"
            />
          </div>

          {/* Right Side (Profile + Hamburger) */}
          <div className="flex items-center space-x-4 relative">
            {!isLoggedIn ? (
              <Link to={"/signin"}>
                <button className="text-[#000000] hover:bg-[#000000] hover:text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-500 border border-[#D9D9D9]">
                  Log In
                </button>
              </Link>
            ) : (
              <>
                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200"
                  >
                    <FaUser className="h-5 w-5 cursor-pointer" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-yellow-500 hover:text-black cursor-pointer"
                      >
                        <MdLogout className="text-red-600" />
                        Uitloggen
                      </button>
                    </div>
                  )}
                </div>

                {/* Hamburger Button (always on right of profile) */}
                <button
                  className="lg:hidden p-2 rounded-md bg-gray-100 shadow"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

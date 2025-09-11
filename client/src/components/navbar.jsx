import { useState, useEffect } from "react"
import { Search, Menu, X, Home, Activity, BarChart2, Info, Newspaper, Badge } from "lucide-react"
import { Link } from "react-router-dom"
import { FaUser } from "react-icons/fa"
import { MdLogout } from "react-icons/md"
import { IoMdSettings } from "react-icons/io"
import { jwtDecode } from "jwt-decode"

import NavImage from "../../public/nav-images/Luumilo_Logo_RGB-1.png"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState("Home")
  const [showBottomNav, setShowBottomNav] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isTestFamily, setIsTestFamily] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setIsLoggedIn(true)
        setIsTestFamily(decoded?.isTestFamily === true)
      } catch (error) {
        console.error("Failed to decode token", error)
        setIsLoggedIn(false)
        setIsTestFamily(false)
      }
    } else {
      setIsLoggedIn(false)
      setIsTestFamily(false)
    }
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen)

  const handleNavClick = (navItem) => {
    setActiveNav(navItem.label)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setShowBottomNav(true)
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowBottomNav(false)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const navItems = [
    { label: "Home", icon: <Home className="h-4 w-4 mr-1" />, to: "/" },
    { label: "Activiteiten", icon: <Activity className="h-4 w-4 mr-1" />, to: "/activities" },
    { label: "Vooruitgang", icon: <BarChart2 className="h-4 w-4 mr-1" />, to: "/progress" },
    ...(isTestFamily ? [] : [{ label: "Abonnementen", icon: <Newspaper className="h-4 w-4 mr-1" />, to: "/pricing" }]),
    { label: "Mijlpalen", icon: <Badge className="h-4 w-4 mr-1" />, to: "/badge-journey" },
    { label: "Over ons", icon: <Info className="h-4 w-4 mr-1" />, to: "/about-us" },
  ]

  const bottomNavItems = [
    { label: "Home", icon: <Home className="h-5 w-5" />, to: "/" },
    { label: "Activiteiten", icon: <Activity className="h-5 w-5" />, to: "/activities" },
    { label: "Vooruitgang", icon: <BarChart2 className="h-5 w-5" />, to: "/progress" },
    ...(isTestFamily ? [] : [{ label: "Abonnementen", icon: <Newspaper className="h-5 w-5" />, to: "/pricing" }]),
    { label: "Mijlpalen", icon: <Badge className="h-5 w-5" />, to: "/badge-journey" },
    { label: "Over ons", icon: <Info className="h-5 w-5" />, to: "/about-us" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-[100000] p-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div>
              <Link to={"/activities"}>
                <img src={NavImage} alt="Logo" className="h-20 w-auto" loading="eager" />
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeNav === item.label ? "text-[#5BA3DD]" : "text-[#000000]"
                    }`}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop profile (lg only) */}
            <div className="hidden lg:flex items-center space-x-4 relative">
              {!isLoggedIn ? (
                <>
                  <Link to={"/signin"}>
                    <button className="text-[#000000] hover:bg-[#000000] hover:text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-500 border border-[#D9D9D9]">
                      Log In
                    </button>
                  </Link>
                  <Link to={"/signup"}>
                    <button className="bg-[#000000] text-white hover:bg-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 "
                  >
                    <FaUser className="h-5 w-5 cursor-pointer" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-46 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                      <Link
                        to="/user-profile/profile"
                        className="px-4 py-2 flex items-center gap-2 text-sm text-gray-800 inter-tight-400 hover:bg-yellow-500 hover:text-black cursor-pointer"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <IoMdSettings className="text-gray-800 cursor-pointer" />
                        Instellingen
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm inter-tight-400 text-red-600 hover:bg-yellow-500 hover:text-black cursor-pointer"
                      >
                        <MdLogout className="text-red-600 cursor-pointer" />
                        Uitloggen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile + Tablet nav (lg:hidden) */}
           {/* Mobile + Tablet nav (lg:hidden) */}
<div className="lg:hidden flex items-center space-x-2 relative">
  <button
    onClick={toggleMenu}
    className="p-2 rounded-md text-[#000000] hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
  >
    {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
  </button>
  {isLoggedIn && (
    <div className="relative">
      <button
        onClick={toggleProfileDropdown}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200"
      >
        <FaUser className="h-5 w-5 cursor-pointer" />
      </button>

      {/* Profile dropdown for mobile */}
      {isProfileDropdownOpen && (
        <div className="absolute right-0 mt-2 w-46 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
          <Link
            to="/user-profile/profile"
            className="px-4 py-2 flex items-center gap-2 text-sm text-gray-800 inter-tight-400 hover:bg-yellow-500 hover:text-black cursor-pointer"
            onClick={() => setIsProfileDropdownOpen(false)}
          >
            <IoMdSettings className="text-gray-800 cursor-pointer" />
            Instellingen
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm inter-tight-400 text-red-600 hover:bg-yellow-500 hover:text-black cursor-pointer"
          >
            <MdLogout className="text-red-600 cursor-pointer" />
            Uitloggen
          </button>
        </div>
      )}
    </div>
  )}
</div>

          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    activeNav === item.label ? "text-[#5BA3DD]" : "text-[#000000]"
                  }`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </Link>
              ))}

              {!isLoggedIn && (
                <div className="px-3 py-2 space-y-2">
                  <Link to={"/signin"}>
                    <button className="text-[#000000] w-full hover:bg-[#000000] hover:text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-500 border border-[#D9D9D9]">
                      Log In
                    </button>
                  </Link>
                  <Link to={"/signup"}>
                    <button className="bg-[#000000] w-full mt-2 text-white hover:bg-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-500">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom nav for mobile */}
      <div
        className={`fixed bottom-0 left-0 right-0 overflow-x-auto z-[99999] bg-white border-t border-gray-200 lg:hidden transition-transform duration-300 ${
          showBottomNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex w-max items-center gap-4 py-2 px-4">
          {bottomNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col min-w-[72px] items-center justify-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                activeNav === item.label ? "text-[#5BA3DD] bg-blue-50" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => handleNavClick(item)}
            >
              {item.icon}
              <span className="text-xs font-medium mt-1 whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

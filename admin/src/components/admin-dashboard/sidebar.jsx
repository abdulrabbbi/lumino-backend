import React from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

import NavImage1 from "../../../public/nav-images/SVG (1).svg";
import NavImage2 from "../../../public/nav-images/SVG (2).svg";
import NavImage3 from "../../../public/nav-images/SVG (3).svg";
import NavImage4 from "../../../public/nav-images/SVG (4).svg";
import NavImage5 from "../../../public/nav-images/SVG (5).svg";
import NavImage6 from "../../../public/nav-images/SVG.svg";
import NavImage7 from "../../../public/nav-images/Vector (1).svg";
import NavImage8 from "../../../public/library-images/Frame (6)-new.svg";
import NavImage9 from "../../../public/rewards.png";
import NavImag10 from "../../../public/nav-images/track-image.jpg";
import NavImage11 from "../../../public/nav-images/analytics.jpg";
import NavImage12 from "../../../public/nav-images/conversion.png";

const Sidebar = () => {
  const { isOpen, setIsOpen } = useSidebar();

  const links = [
    { to: "/admin-dashboard/dashboard", label: "Dashboard", image: NavImage6 },
    { to: "/admin-dashboard/activiteitenbeheer", label: "Activiteiten Beheer", image: NavImage7 },
    { to: "/admin-dashboard/ingezondenactiviteiten", label: "Ingezonden Activiteiten", image: NavImage1 },
    { to: "/admin-dashboard/gebruikersbeheer", label: "Gebruikers", image: NavImage2 },
    { to: "/admin-dashboard/contactberichten", label: "Contact Berichten", image: NavImage3 },
    { to: "/admin-dashboard/testgroepaanmeldingen", label: "Testgroep Aanmeldingen", image: NavImage1 },
    { to: "/admin-dashboard/kwaliteitsaudit", label: "Kwaliteitsaudit", image: NavImage4 },
    { to: "/admin-dashboard/earlyaccess", label: "Early Access", image: NavImage5 },
    { to: "/admin-dashboard/manage-badge", label: "Manage Badge", image: NavImage8 },
    { to: "/admin-dashboard/marketinggebruikers", label: "Marketing Gebruikers", image: NavImage2 },
    { to: "/admin-dashboard/reward-settings", label: "Beloningen", image: NavImage9 },
    { to: "/admin-dashboard/events-tracking", label: "Eventtracking", image: NavImag10 },
    { to: "/admin-dashboard/funnel-conversion", label: "Funnel Conversion", image: NavImage12 },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform lg:z-50 z-[10000000] transition-transform duration-500 lg:translate-x-0 lg:relative md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end md:hidden p-4 border-b">
          <button onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Links */}
        <div className="flex flex-col overflow-y-auto h-[calc(100vh-64px)]">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `p-4 flex items-center gap-3 inter-tight-400 ${
                  isActive ? "bg-[#F1F6FB] text-[#2563EB]" : "text-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)} // auto-close on mobile after click
            >
              <img src={link.image} alt={link.label} className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

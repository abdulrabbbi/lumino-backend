import React from "react";
import { NavLink } from "react-router-dom";

import NavImage1 from '../../../public/nav-images/SVG (1).svg'
import NavImage2 from '../../../public/nav-images/SVG (2).svg'
import NavImage3 from '../../../public/nav-images/SVG (3).svg'
import NavImage4 from '../../../public/nav-images/SVG (4).svg'
import NavImage5 from '../../../public/nav-images/SVG (5).svg'
import NavImage6 from '../../../public/nav-images/SVG.svg'
import NavImage7 from '../../../public/nav-images/Vector (1).svg'
import NavImage8 from '../../../public/library-images/Frame (6)-new.svg'

const Sidebar = () => {
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

  ];

  return (
    <nav className="w-full md:w-64 flex-shrink-0 sticky top-4 bg-white z-10 shadow md:shadow-none ">
      <div className="flex flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `p-4 flex items-center gap-3 inter-tight-400 ${
                isActive ? "bg-[#F1F6FB] text-[#2563EB]" : "text-gray-700"
              }`
            }
          >
            <img src={link.image} alt={link.label} className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;

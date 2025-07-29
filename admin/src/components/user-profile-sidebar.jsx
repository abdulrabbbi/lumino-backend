/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import { FiUser, FiBell, FiSettings, FiUserCheck } from "react-icons/fi";
import { MdSubscriptions } from "react-icons/md";
import { Badge } from "lucide-react";

const Sidebar = () => {
  const links = [
    { to: "/user-profile/profile", label: "Profile", icon: <FiUser className="mr-2" /> },
    { to: "/user-profile/subscription", label: "Subscription", icon: <MdSubscriptions className="mr-2" /> },
    { to: "/user-profile/preferences", label: "Preferences", icon: <FiSettings className="mr-2" /> },
    { to: "/user-profile/notifications", label: "Notifications", icon: <FiBell className="mr-2" /> },
    { to: "/user-profile/refer-a-friend", label: "Refer a Friend", icon: <FiUserCheck className="mr-2" /> },
    { to: "/user-profile/earn-a-badge", label: "Earned Badges", icon: <Badge className="mr-2" /> },


  ];

  return (
    <nav className="w-full md:w-64 flex-shrink-0 sticky top-4 bg-white z-10 shadow md:shadow-none">
  <div className="flex flex-col">
    {links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) =>
          `p-4 flex items-center cursor-pointer inter-tight-400 ${
            isActive ? "bg-[#F1F6FB] text-[#2563EB]" : "text-gray-700"
          }`
        }
      >
        {link.icon}
        {link.label}
      </NavLink>
    ))}
  </div>
</nav>

  );
};

export default Sidebar;

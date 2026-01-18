import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaComments,
  FaCog,
  FaChartBar,
  FaChartLine,
  FaSignOutAlt,
  FaUserCircle,
  FaHeart,
  FaBookmark,
  FaTimes,
  FaGem,
  FaStar,
  FaVideo,
  FaRobot,
} from "react-icons/fa";
import { HiOutlineX, HiSparkles } from "react-icons/hi";
import { FaCartShopping } from "react-icons/fa6";
import { useTheme } from "../../contexts/ThemeContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen, userProfile, isConnected }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { address } = useAccount();

  const mainNavigation = [
    { name: "Home", href: "/", icon: FaHome, current: router.pathname === "/" },
    {
      name: "Profile",
      href: `/profile/${address}`,
      icon: FaUser,
      current: router.pathname.includes("/profile"),
    },
    {
      name: "Users",
      href: "/users",
      icon: FaUsers,
      current: router.pathname === "/users",
    },
    {
      name: "Groups",
      href: "/groups",
      icon: FaUsers,
      current: router.pathname === "/groups",
    },
    {
      name: "Messages",
      href: "/messages",
      icon: FaComments,
      current: router.pathname === "/messages",
    },
  ];

  const secondaryNavigation = [
    {
      name: "Market",
      href: "/market",
      icon: FaChartLine,
      current: router.pathname === "/market",
    },
    {
      name: "Live",
      href: "/live",
      icon: FaVideo,
      current: router.pathname === "/live",
    },
    {
      name: "AI Chat",
      href: "/ai-chat",
      icon: FaRobot,
      current: router.pathname === "/ai-chat",
    },
  ];

  const adminNavigation = [
    {
      name: "Admin Panel",
      href: "/admin",
      icon: FaChartBar,
      current: router.pathname === "/admin",
    },
  ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 sidebar-container lg:static lg:block transition-all duration-500 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full glass-panel border-r-0 lg:border-r">
          <div className="flex items-center justify-between h-20 px-6 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-black text-xl">L</span>
              </div>
              <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Liberty</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-xl ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <HiOutlineX className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-4 space-y-10 sidebar-scroll">
            <div>
              <h3 className={`px-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${theme === 'dark' ? 'text-purple-400/60' : 'text-gray-400'}`}>
                Main Menu
              </h3>
              <nav className="space-y-1.5">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-2xl group transition-all duration-300 ${item.current
                      ? theme === 'dark'
                        ? 'bg-purple-600/20 text-purple-400 cyber-border'
                        : 'bg-purple-600/10 text-purple-600 font-bold'
                      : theme === 'dark'
                        ? 'text-white/50 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100/50'
                      }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${item.current
                      ? theme === 'dark' ? "text-cyan-400" : "text-purple-600"
                      : theme === 'dark' ? "text-white/30 group-hover:text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                      }`} />
                    {item.name}
                    {item.current && theme === 'dark' && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 cyber-glow" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className={`px-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${theme === 'dark' ? 'text-cyan-400/60' : 'text-gray-400'}`}>
                Explore LS
              </h3>
              <nav className="space-y-1.5">
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-2xl group transition-all duration-300 ${item.current
                      ? theme === 'dark'
                        ? 'bg-cyan-600/20 text-cyan-400 cyber-border'
                        : 'bg-cyan-600/10 text-cyan-600 font-bold'
                      : theme === 'dark'
                        ? 'text-white/50 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100/50'
                      }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${item.current
                      ? theme === 'dark' ? "text-purple-400" : "text-cyan-600"
                      : theme === 'dark' ? "text-white/30 group-hover:text-cyan-400" : "text-gray-500 group-hover:text-cyan-400"
                      }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className={`px-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${theme === 'dark' ? 'text-red-400/60' : 'text-gray-400'}`}>
                System Control
              </h3>
              <nav className="space-y-1.5">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-2xl group transition-all duration-300 ${item.current
                      ? theme === 'dark'
                        ? 'bg-red-600/20 text-red-400 cyber-border'
                        : 'bg-red-600/10 text-red-600 font-bold'
                      : theme === 'dark'
                        ? 'text-white/50 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100/50'
                      }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${item.current
                      ? theme === 'dark' ? "text-red-400" : "text-red-600"
                      : theme === 'dark' ? "text-white/30 group-hover:text-red-400" : "text-gray-500 group-hover:text-red-400"
                      }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

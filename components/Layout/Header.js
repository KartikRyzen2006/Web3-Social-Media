import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaSun, FaMoon, FaBars, FaSearch, FaBell, FaUsers, FaComments, FaHome, FaUserPlus, FaTimes, FaUserCircle, FaTrash, FaClock, FaReply, FaEnvelope, FaCheck, FaSpinner } from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";
import { useNotifications } from "../../contexts/NotificationContext";
import { contractService } from "../../lib/contract";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";

const Header = ({ sidebarOpen, setSidebarOpen, userProfile, isConnected }) => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { userProfile: currentProfile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [followBackLoading, setFollowBackLoading] = useState({});
  const [followedNotifications, setFollowedNotifications] = useState(new Set());
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleFollowBack = async (e, notification) => {
    e.stopPropagation(); // Prevent notification click event

    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    setFollowBackLoading((prev) => ({ ...prev, [notification.id]: true }));

    try {
      console.log("Following back user:", notification.fromAddress);
      console.log("Current user:", address);
      console.log("Wallet client available:", !!walletClient);
      console.log("Public client available:", !!publicClient);

      const isFollowing = await contractService.checkIsFollowing(
        publicClient,
        address,
        notification.fromAddress
      );

      console.log("Is already following:", isFollowing);

      if (isFollowing) {
        toast("You're already following this user", {
          icon: 'ℹ️',
        });
        setFollowBackLoading((prev) => ({ ...prev, [notification.id]: false }));
        return;
      }

      const result = await contractService.followUser(
        walletClient,
        notification.fromAddress
      );

      console.log("Follow result:", result);

      if (result.success) {
        toast.success("Followed back successfully!");

        setFollowedNotifications((prev) => new Set([...prev, notification.id]));

        const notificationKey = `notifications_${notification.fromAddress}`;
        const existingNotifications = JSON.parse(
          localStorage.getItem(notificationKey) || "[]"
        );

        const acceptNotification = {
          id: Date.now().toString() + Math.random().toString(36),
          type: "follow_accept",
          fromAddress: address,
          fromUsername: userProfile?.name || "User",
          message: `${userProfile?.name} accepted your follow request`,
          timestamp: Date.now(),
          read: false,
        };

        existingNotifications.unshift(acceptNotification);
        localStorage.setItem(
          notificationKey,
          JSON.stringify(existingNotifications)
        );
      } else {
        const errorMsg = result.error || "Transaction failed";
        console.error("Follow failed:", errorMsg);
        toast.error(errorMsg.includes("rejected") || errorMsg.includes("denied")
          ? "Transaction rejected"
          : "Failed to follow back");
      }
    } catch (error) {
      console.error("Error following back:", error);
      const errorMessage = error?.message || error?.toString() || "";

      if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
        toast.error("Transaction rejected");
      } else if (errorMessage.includes("insufficient")) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error("Failed to follow back. Please try again.");
      }
    } finally {
      setFollowBackLoading((prev) => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleMessage = (e, notification) => {
    e.stopPropagation();
    markAsRead(notification.id);
    setShowNotifications(false);
    router.push(`/messages?user=${notification.fromAddress}`);
  };

  const navItems = [
    { href: "/", icon: FaHome, label: "Home", active: router.pathname === "/" },
    {
      href: "/users",
      icon: FaUsers,
      label: "Users",
      active: router.pathname === "/users",
    },
    {
      href: "/groups",
      icon: FaUsers,
      label: "Groups",
      active: router.pathname === "/groups",
    },
    {
      href: "/messages",
      icon: FaComments,
      label: "Messages",
      active: router.pathname === "/messages",
    },
  ];

  return (
    <>
      <header className="header-glass backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center">
              <button
                type="button"
                className={`p-2 rounded-xl lg:hidden transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>

              <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0">
                <Link href="/" className="flex items-center min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative group">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50 transform hover:scale-105 transition-all duration-300">
                        <span className="text-white font-black text-xl sm:text-2xl tracking-tighter">L</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-l-2 border-t-2 border-cyan-400 rounded-tl"></div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-r-2 border-b-2 border-purple-400 rounded-br"></div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="flex items-baseline md:gap-0.5">
                        <span className={`text-xl lg:text-2xl font-black bg-gradient-to-r ${theme === 'dark' ? 'from-purple-400 to-purple-300' : 'from-purple-600 to-purple-500'
                          } bg-clip-text text-transparent tracking-tight`}>
                          Liberty
                        </span>
                        <span className={`text-xl lg:text-2xl font-black bg-gradient-to-r ${theme === 'dark' ? 'from-cyan-300 to-cyan-200' : 'from-cyan-500 to-cyan-400'
                          } bg-clip-text text-transparent tracking-tight`}>
                          Social
                        </span>
                      </div>
                      <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 rounded-full mt-0.5 shadow-sm shadow-purple-400/50"></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users, posts, groups..."
                    className={`block w-full pl-11 pr-4 py-2.5 border rounded-2xl leading-5 transition-all duration-300 sm:text-sm focus:outline-none focus:ring-2 ${theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-purple-500/30'
                      : 'bg-gray-100 border-transparent text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-purple-500/20'
                      }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'dark'
                  ? 'bg-white/5 text-yellow-400 hover:bg-white/10 shadow-lg shadow-yellow-500/10'
                  : 'bg-gray-100 text-purple-600 hover:bg-purple-100 shadow-sm'
                  }`}
              >
                {theme === 'dark' ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
              </button>

              {isConnected && userProfile?.exists && (
                <div className="hidden lg:flex items-center gap-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`p-2.5 rounded-xl transition-all duration-200 group relative ${item.active
                          ? theme === 'dark'
                            ? 'bg-purple-600/20 text-purple-400 cyber-border'
                            : 'bg-purple-600/10 text-purple-600'
                          : theme === 'dark'
                            ? 'text-white/50 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100/50'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className={`absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${theme === 'dark' ? 'bg-white/10 text-white border border-white/10' : 'bg-gray-900 text-white'
                          }`}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}

              {isConnected && userProfile?.exists && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative ${theme === 'dark'
                      ? 'text-white/50 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                      }`}
                  >
                    <FaBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl shadow-2xl border overflow-hidden z-50 transform animate-in slide-in-from-top-2 duration-200 ${theme === 'dark'
                      ? 'bg-black/90 backdrop-blur-xl border-white/10'
                      : 'bg-white/95 backdrop-blur-xl border-gray-100'
                      }`}>
                      <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
                        }`}>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        {notifications.length > 0 && (
                          <button onClick={handleClearAll} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {notifications.map((n) => (
                              <div key={n.id} className={`px-6 py-4 hover:bg-white/5 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}>
                                <div className="flex items-start gap-3">
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                                    {n.fromUsername?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                                      <span className="font-bold text-blue-400">{n.fromUsername}</span> {n.type === 'follow' ? 'started following you' : 'accepted your request'}
                                    </p>
                                    <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>{new Date(n.timestamp).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-gray-500 text-sm italic">Nothing new here...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isConnected && userProfile?.exists && (
                <Link
                  href={`/profile/${address}`}
                  className={`hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-2xl transition-all duration-300 group ${theme === 'dark'
                    ? 'bg-white/5 cyber-border hover:bg-white/10 cyber-glow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm'
                    }`}
                >
                  <div className="relative">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0d0b1c] rounded-full animate-pulse"></div>
                  </div>
                  <div className="hidden lg:block min-w-0 pr-1">
                    <p className={`text-xs font-black truncate leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-[7px] uppercase font-bold tracking-tighter ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Posts</span>
                        <span className={`text-[9px] font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{userProfile.postCount?.toString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[7px] uppercase font-bold tracking-tighter ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Syncs</span>
                        <span className={`text-[9px] font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{userProfile.followerCount?.toString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              <div className="flex items-center">
                <div className={`[&>div]:rounded-2xl transition-all ${theme === 'dark'
                  ? '[&>div]:!bg-white/5 [&>div]:!border-white/10 [&>div]:shadow-blue-500/10'
                  : '[&>div]:!bg-white [&>div]:!border-gray-200'
                  }`}>
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showMobileSearch && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-md flex items-start pt-4 px-4">
          <div className={`w-full p-4 rounded-3xl border ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-gray-100'
            }`}>
            <div className="flex gap-3">
              <input
                autoFocus
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <button onClick={() => setShowMobileSearch(false)} className="p-2 text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;

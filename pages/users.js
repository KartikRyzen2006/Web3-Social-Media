import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Head from "next/head";
import Link from "next/link";
import {
  FaUserPlus,
  FaUserMinus,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaGlobe,
  FaStar,
  FaCalendarAlt,
  FaSpinner,
  FaCompass,
  FaHeart,
  FaEye,
  FaCheck,
} from "react-icons/fa";
import { contractService } from "../lib/contract";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { PAGINATION } from "../lib/constants";
import toast from "react-hot-toast";

export default function Users() {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();
  const { addFollowNotification } = useNotifications();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [followingStates, setFollowingStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: PAGINATION.usersPerPage,
    total: 0,
    hasMore: false,
  });

  // Fetch users
  const fetchUsers = async (reset = false) => {
    if (!publicClient) return;

    setLoading(true);
    try {
      const offset = reset ? 0 : pagination.offset;
      const result = await contractService.getAllUsers(
        publicClient,
        offset,
        pagination.limit
      );

      const newUsers = reset ? result.users : [...users, ...result.users];
      setUsers(newUsers);

      setPagination({
        offset: offset + result.users.length,
        limit: pagination.limit,
        total: result.total,
        hasMore: offset + result.users.length < result.total,
      });

      // Check following status for each user
      if (address && result.users.length > 0) {
        const followingChecks = {};
        for (const user of result.users) {
          if (user.owner.toLowerCase() !== address.toLowerCase()) {
            try {
              const isFollowing = await contractService.checkIsFollowing(
                publicClient,
                address,
                user.owner
              );
              followingChecks[user.owner] = isFollowing;
            } catch (error) {
              console.error("Error checking follow status:", error);
              followingChecks[user.owner] = false;
            }
          }
        }
        setFollowingStates((prev) => ({ ...prev, ...followingChecks }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [publicClient, address]);

  const handleFollow = async (userAddress) => {
    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    setFollowLoading((prev) => ({ ...prev, [userAddress]: true }));

    try {
      const isCurrentlyFollowing = followingStates[userAddress];
      const result = isCurrentlyFollowing
        ? await contractService.unfollowUser(walletClient, userAddress)
        : await contractService.followUser(walletClient, userAddress);

      if (result.success) {
        setFollowingStates((prev) => ({
          ...prev,
          [userAddress]: !isCurrentlyFollowing,
        }));

        // Update user counts in the list
        setUsers((prev) =>
          prev.map((user) => {
            if (user.owner === userAddress) {
              return {
                ...user,
                followerCount: isCurrentlyFollowing
                  ? user.followerCount - 1
                  : user.followerCount + 1,
              };
            }
            return user;
          })
        );

        // Create notification for the followed user
        if (!isCurrentlyFollowing) {
          const followedUser = users.find((u) => u.owner === userAddress);
          if (followedUser && userProfile?.name) {
            // Store notification in followed user's localStorage
            const notificationKey = `notifications_${userAddress}`;
            const existingNotifications = JSON.parse(
              localStorage.getItem(notificationKey) || "[]"
            );

            const newNotification = {
              id: Date.now().toString() + Math.random().toString(36),
              type: "follow",
              fromAddress: address,
              fromUsername: userProfile.name,
              message: `${userProfile.name} followed you`,
              timestamp: Date.now(),
              read: false,
            };

            existingNotifications.unshift(newNotification);
            localStorage.setItem(
              notificationKey,
              JSON.stringify(existingNotifications)
            );
          }
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userAddress]: false }));
    }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchUsers(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!user || !user.name || !user.owner) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.owner.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Head>
        <title>Discover People - Liberty Social</title>
        <meta
          name="description"
          content="Discover and connect with people on Liberty Social"
        />
      </Head>

      <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
        {/* Enhanced Page Header */}
        <div className="glass-panel p-8 md:p-12 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${theme === 'dark' ? 'bg-purple-600/20 cyber-border' : 'bg-purple-100'}`}>
                  <FaCompass className={`h-7 w-7 ${theme === 'dark' ? 'text-purple-400 cyber-glow' : 'text-purple-600'}`} />
                </div>
                <div>
                  <h1 className={`text-3xl md:text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Discover <span className={theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent'}>People</span>
                  </h1>
                  <div className={`flex items-center space-x-6 mt-1 text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-2">
                      <FaUsers className="h-3 w-3" /> {pagination.total} ENTITIES
                    </span>
                    <span className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-400'}`}></span>
                    <span className="flex items-center gap-2">
                      <FaGlobe className="h-3 w-3" /> DECENTRALIZED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-96 group/search">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FaSearch className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400/50 group-focus-within/search:text-cyan-400' : 'text-gray-400 group-focus-within/search:text-purple-600'}`} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search unique ID..."
                className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] border text-sm font-black uppercase tracking-widest transition-all duration-500 shadow-xl focus:outline-none focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-white placeholder-white/40 focus:border-cyan-400/50 focus:bg-white/10' : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:shadow-2xl'}`}
              />
              {theme === 'dark' && (
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-focus-within/search:opacity-100 blur-xl -z-10 transition-opacity duration-500"></div>
              )}
            </div>
          </div>

          <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 via-transparent to-cyan-500' : 'bg-gradient-to-br from-purple-50 via-transparent to-indigo-50'}`}></div>
        </div>

        {/* Users List or Loading */}
        <div className="space-y-8">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl ${theme === 'dark' ? 'bg-white/5 cyber-border cyber-glow' : 'bg-white shadow-xl'}`}>
                <LoadingSpinner size="xl" />
              </div>
              <h3 className={`text-2xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Syncing Community
              </h3>
              <p className={`font-medium tracking-tight ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>Accessing the decentralized user matrix...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredUsers.map((user) => {
                  if (!user || !user.owner || !user.name) return null;

                  const isCurrentUser = address && user.owner.toLowerCase() === address.toLowerCase();
                  const isFollowing = followingStates[user.owner];
                  const isFollowLoading = followLoading[user.owner];

                  return (
                    <div
                      key={user.owner}
                      className={`group rounded-[2.5rem] p-8 border transition-all duration-500 hover:scale-[1.02] transform relative overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-purple-500/10 hover:border-purple-500/40 hover:bg-white/10 cyber-glow-sm' : 'bg-white border-gray-100 hover:shadow-2xl'}`}
                    >
                      {/* User Info Container */}
                      <div className="relative z-10 text-center space-y-6">
                        <Link href={`/profile/${user.owner}`}>
                          <div className="relative inline-block cursor-pointer group/avatar">
                            <div className={`h-28 w-28 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-500 group-hover/avatar:scale-110 transform group-hover/avatar:rotate-3 ${theme === 'dark' ? 'bg-[#0d0b1c] border-2 border-purple-500/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
                              <span className={`text-4xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-white'}`}>
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 shadow-xl ${theme === 'dark' ? 'bg-green-400 border-[#1a1635]' : 'bg-green-500 border-white'}`}></div>
                            {isCurrentUser && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                <FaStar className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="space-y-1">
                          <Link href={`/profile/${user.owner}`}>
                            <h3 className={`text-2xl font-black tracking-tight transition-colors ${theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-gray-900 group-hover:text-purple-600'}`}>
                              {user.name}
                            </h3>
                          </Link>
                          <p className={`text-[10px] font-black tracking-widest uppercase py-1.5 px-4 rounded-xl border w-fit mx-auto transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-purple-400 group-hover:border-purple-500/50' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                            {user.owner?.slice(0, 6)}...{user.owner?.slice(-4)}
                          </p>
                        </div>

                        {/* Stats Matrix */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10' : 'bg-gray-50 border-gray-100'}`}>
                            <p className={`text-lg font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                              {user.postCount || 0}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>SIGNALS</p>
                          </div>
                          <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10' : 'bg-gray-50 border-gray-100'}`}>
                            <p className={`text-lg font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`}>
                              {user.followerCount || 0}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>SYNCS</p>
                          </div>
                          <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10' : 'bg-gray-50 border-gray-100'}`}>
                            <p className={`text-lg font-black ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`}>
                              {user.followingCount || 0}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>CHANNELS</p>
                          </div>
                        </div>

                        {/* Action Suite */}
                        <div className="space-y-3 pt-2">
                          {!isCurrentUser && isConnected && userProfile?.exists && (
                            <button
                              onClick={() => handleFollow(user.owner)}
                              disabled={isFollowLoading}
                              className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 ${isFollowing
                                ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                : theme === 'dark' ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                                }`}
                            >
                              {isFollowLoading ? (
                                <FaSpinner className="animate-spin h-4 w-4 mr-3" />
                              ) : isFollowing ? (
                                <FaUserMinus className="mr-3 h-4 w-4" />
                              ) : (
                                <FaUserPlus className="mr-3 h-4 w-4" />
                              )}
                              {isFollowing ? "Sever Connection" : "Sync Neural Net"}
                            </button>
                          )}

                          <Link
                            href={`/profile/${user.owner}`}
                            className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 group/btn transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-white/70 hover:text-white hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
                          >
                            <FaEye className={`mr-3 h-4 w-4 transition-transform ${theme === 'dark' ? 'text-cyan-400 group-hover/btn:scale-125' : 'text-purple-600 group-hover/btn:scale-125'}`} />
                            View Identity
                          </Link>

                          {isCurrentUser && (
                            <div className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${theme === 'dark' ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                              <FaStar className="mr-3 h-4 w-4 cyber-glow" />
                              Personal Core
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card background embellishment */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600/50 to-transparent' : 'bg-gradient-to-br from-purple-50 to-transparent'}`}></div>
                    </div>
                  );
                })}
              </div>

              {/* Discovery Engine Controls */}
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                {pagination.hasMore && !loading && (
                  <button
                    onClick={handleLoadMore}
                    className={`inline-flex items-center px-12 py-5 text-sm font-black uppercase tracking-widest text-white rounded-[2rem] transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:shadow-purple-500/40' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                  >
                    <FaCompass className="mr-4 h-5 w-5 animate-spin-slow" />
                    Expand Neural Field
                  </button>
                )}

                {loading && users.length > 0 && (
                  <div className={`inline-flex items-center space-x-4 px-8 py-4 rounded-[1.5rem] border shadow-2xl ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-purple-400' : 'bg-white border-gray-100 text-purple-700'}`}>
                    <FaSpinner className="animate-spin h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Scanning New Entities...</span>
                  </div>
                )}

                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center space-y-8 py-10">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/20' : 'bg-gray-100'}`}>
                      <FaUsers className={`h-12 w-12 ${theme === 'dark' ? 'text-purple-400/40' : 'text-gray-300'}`} />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {searchTerm ? "No Neural Matches" : "The Grid is Empty"}
                    </h3>
                    <p className={`font-medium max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                      {searchTerm
                        ? `The search term "${searchTerm}" yielded no results in the decentralized identity manifest.`
                        : "No entities have been registered in the network yet. Be the first to establish a node."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border border-purple-500/30 text-white hover:bg-white/10' : 'bg-purple-600 text-white shadow-xl hover:bg-purple-700'}`}
                      >
                        Reset Manifest
                      </button>
                    )}
                  </div>
                )}

                {!pagination.hasMore && filteredUsers.length > 0 && !loading && (
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl border ${theme === 'dark' ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <FaCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Manifest Complete</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Join Prompt for Unconnected Hosts */}
          {!isConnected && (
            <div className={`glass-panel p-10 md:p-16 relative overflow-hidden group mt-12`}>
              <div className="relative z-10 text-center space-y-8">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-cyan-500' : 'bg-gradient-to-br from-purple-600 to-pink-500'}`}>
                  <FaUserCircle className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Initialize Your <span className={theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'}>Neural Core</span>
                  </h3>
                  <p className={`text-lg font-medium max-w-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    Connect your wallet to synchronize with the Liberty Social community. Unlock the ability to follow entities, broadcast signals, and manage your decentralized identity.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                    <FaUsers className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span>Sync Entities</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                    <FaHeart className={`h-4 w-4 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
                    <span>Like Signals</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                    <FaGlobe className={`h-4 w-4 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    <span>Decentralized Node</span>
                  </div>
                </div>
              </div>
              <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 via-transparent to-cyan-500' : 'bg-gradient-to-br from-purple-50 via-transparent to-pink-50'}`}></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

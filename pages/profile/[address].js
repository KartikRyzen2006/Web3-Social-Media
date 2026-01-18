import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Head from "next/head";
import Link from "next/link";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaUserPlus,
  FaUserMinus,
  FaEdit,
  FaTrash,
  FaCog,
  FaUsers,
  FaHeart,
  FaStar,
  FaGlobe,
  FaRocket,
  FaSpinner,
  FaArrowLeft,
  FaEye,
  FaComments,
  FaThumbsUp,
  FaMagic,
  FaPaperPlane,
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { useTheme } from "../../contexts/ThemeContext";
import { contractService } from "../../lib/contract";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useNotifications } from "../../contexts/NotificationContext";
import PostCard from "../../components/Posts/PostCard";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp * 1000);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { address: profileAddress } = router.query;
  const { address: currentUserAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile: currentUserProfile } = useUserProfile();
  const { addFollowNotification } = useNotifications();

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile =
    currentUserAddress &&
    profileAddress &&
    currentUserAddress.toLowerCase() === profileAddress.toLowerCase();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!publicClient || !profileAddress) return;

      setLoading(true);
      try {
        const profileData = await contractService.getProfile(
          publicClient,
          profileAddress
        );

        if (!profileData?.exists) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        const posts = await contractService.getUserPosts(
          publicClient,
          profileAddress
        );

        // Fetch activity (likes/comments) for this profile
        const activityKey = `activity_${profileAddress.toLowerCase()}`;
        const activity = JSON.parse(localStorage.getItem(activityKey) || "[]");

        if (activity.length > 0) {
          // Fetch all posts to find the interacted ones
          // Note: In a production app, we would fetch posts by ID. 
          // Here we fetch a large batch and filter.
          const { posts: allPosts } = await contractService.getAllPosts(publicClient, 0, 200);

          const interactedPosts = activity.map(act => {
            const post = allPosts.find(p => p.postID === act.postId);
            if (post) {
              return {
                ...post,
                interaction: {
                  type: act.type,
                  address: profileAddress,
                  username: profileData.name
                },
                activityTimestamp: act.timestamp
              };
            }
            return null;
          }).filter(Boolean);

          // Merge and sort
          const mergedPosts = [
            ...posts.map(p => ({ ...p, activityTimestamp: p.timeCreated * 1000 })),
            ...interactedPosts.filter(ip => !posts.find(p => p.postID === ip.postID))
          ].sort((a, b) => b.activityTimestamp - a.activityTimestamp);

          setUserPosts(mergedPosts);
        } else {
          setUserPosts(posts);
        }

        const [followersList, followingList] = await Promise.all([
          contractService.getUserFollowers(publicClient, profileAddress),
          contractService.getUserFollowing(publicClient, profileAddress),
        ]);

        setFollowers(followersList);
        setFollowing(followingList);

        if (currentUserAddress && !isOwnProfile) {
          const followStatus = await contractService.checkIsFollowing(
            publicClient,
            currentUserAddress,
            profileAddress
          );
          setIsFollowing(followStatus);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [publicClient, profileAddress, currentUserAddress, isOwnProfile]);

  const handleFollow = async () => {
    if (!walletClient || !currentUserAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!currentUserProfile?.exists) {
      toast.error("Please create your profile first");
      return;
    }

    setFollowLoading(true);

    try {
      const result = isFollowing
        ? await contractService.unfollowUser(walletClient, profileAddress)
        : await contractService.followUser(walletClient, profileAddress);

      if (result.success) {
        setIsFollowing(!isFollowing);

        if (!isFollowing && currentUserProfile?.name) {
          const isFollowBack = await contractService.checkIsFollowing(publicClient, profileAddress, currentUserAddress);
          addFollowNotification(profileAddress, currentUserAddress, currentUserProfile.name, isFollowBack);
        }

        setProfile((prev) => ({
          ...prev,
          followerCount: isFollowing
            ? prev.followerCount - 1
            : prev.followerCount + 1,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!walletClient || !currentUserAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    const newUsername = window.prompt("Enter new username:");
    if (!newUsername) return;

    // Basic validation
    if (newUsername.length > 50) {
      toast.error("Username too long (max 50 chars)");
      return;
    }

    try {
      const result = await contractService.updateUsername(walletClient, newUsername);
      if (result.success) {
        // contractService handles reload on success
      }
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    }
  };

  const handleDeleteAccount = async () => {
    if (!walletClient || !currentUserAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
      )
    ) {
      return;
    }

    try {
      const result = await contractService.deleteAccount(walletClient);
      if (result.success) {
        // contractService handles reload
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const refreshPosts = async () => {
    if (publicClient && profileAddress) {
      try {
        const posts = await contractService.getUserPosts(
          publicClient,
          profileAddress
        );

        // Fetch activity for refresh
        const activityKey = `activity_${profileAddress.toLowerCase()}`;
        const activity = JSON.parse(localStorage.getItem(activityKey) || "[]");

        if (activity.length > 0) {
          const { posts: allPosts } = await contractService.getAllPosts(publicClient, 0, 200);
          const interactedPosts = activity.map(act => {
            const post = allPosts.find(p => p.postID === act.postId);
            if (post) {
              return {
                ...post,
                interaction: {
                  type: act.type,
                  address: profileAddress,
                  username: profile?.name || "User"
                },
                activityTimestamp: act.timestamp
              };
            }
            return null;
          }).filter(Boolean);

          const mergedPosts = [
            ...posts.map(p => ({ ...p, activityTimestamp: p.timeCreated * 1000 })),
            ...interactedPosts.filter(ip => !posts.find(p => p.postID === ip.postID))
          ].sort((a, b) => b.activityTimestamp - a.activityTimestamp);

          setUserPosts(mergedPosts);
        } else {
          setUserPosts(posts);
        }

        const profileData = await contractService.getProfile(
          publicClient,
          profileAddress
        );
        if (profileData?.exists) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error refreshing posts:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl ${theme === 'dark' ? 'bg-white/5 cyber-border cyber-glow' : 'bg-white shadow-xl'}`}>
          <LoadingSpinner size="xl" />
        </div>
        <h3 className={`text-2xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Syncing Profile
        </h3>
        <p className="text-gray-500 font-medium tracking-tight">Accessing the decentralized identity layer...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="glass-panel p-12 overflow-hidden text-center relative group">
          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/30' : 'bg-gray-100 border border-gray-200'}`}>
              <FaUserCircle className={`h-12 w-12 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
            </div>
            <h1 className={`text-4xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Identity Not Found
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed font-medium">
              This entity does not exist in the decentralized network or the address provided is invalid.
            </p>
            <Link
              href="/"
              className={`inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:shadow-purple-500/40' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
            >
              <FaArrowLeft className="mr-3 h-5 w-5" />
              Return Home
            </Link>
          </div>
          <div className={`absolute inset-0 transition-opacity duration-500 opacity-20 group-hover:opacity-30 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600/10 to-cyan-500/10' : 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{profile.name} - Liberty Social</title>
        <meta
          name="description"
          content={`${profile.name}'s profile on Liberty Social`}
        />
      </Head>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Profile Header */}
        <div className="glass-panel overflow-hidden">
          {/* Enhanced Cover Image */}
          <div className={`relative h-56 md:h-80 overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-[#1a1635] via-[#2d1b4e] to-[#1a1635]' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'}`}>
            <div className={`absolute inset-0 opacity-40 ${theme === 'dark' ? 'bg-[#0d0b1c]' : ''}`}></div>
            {theme === 'dark' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent)] animate-pulse"></div>
            )}
            {isOwnProfile && (
              <div className="absolute top-8 right-8">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border backdrop-blur-md ${theme === 'dark' ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' : 'bg-white/30 border-white/40 text-white'}`}>
                  <FaStar className={`h-4 w-4 ${theme === 'dark' ? 'cyber-glow' : ''}`} />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Your Domain
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Profile Info */}
          <div className="px-8 md:px-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-24 md:-mt-32 mb-10">
              {/* Enhanced Profile Picture */}
              <div className="relative mb-8 md:mb-0 group">
                <div className={`h-40 w-40 md:h-52 md:w-52 rounded-[2.5rem] border-[6px] shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 transform group-hover:rotate-2 ${theme === 'dark' ? 'bg-[#0d0b1c] border-[#1a1635] shadow-purple-500/20' : 'bg-white border-white'}`}>
                  <span className={`text-6xl md:text-8xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent'}`}>
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 shadow-xl flex items-center justify-center ${theme === 'dark' ? 'bg-green-400 border-[#0d0b1c]' : 'bg-green-500 border-white'}`}>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={handleUpdateUsername}
                      className={`inline-flex items-center px-6 py-4 border rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-gray-300 hover:text-white hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <FaEdit className="mr-3 h-4 w-4" />
                      Update Username
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className={`inline-flex items-center px-6 py-4 border rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-105 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20`}
                    >
                      <FaTrash className="mr-3 h-4 w-4" />
                      Delete Account
                    </button>
                    <Link
                      href="/ai-chat"
                      className={`inline-flex items-center px-8 py-4 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-purple-500/40' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                    >
                      <FaMagic className="mr-3 h-4 w-4" />
                      Neural AI
                    </Link>
                  </>
                ) : (
                  isConnected &&
                  currentUserProfile?.exists && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`inline-flex items-center px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 ${isFollowing
                        ? "bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-red-500/30"
                        : theme === 'dark' ? "bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-purple-500/40" : "bg-gradient-to-r from-purple-600 to-indigo-600"
                        }`}
                    >
                      {followLoading ? (
                        <FaSpinner className="animate-spin h-5 w-5 mr-3" />
                      ) : isFollowing ? (
                        <FaUserMinus className="mr-3 h-5 w-5" />
                      ) : (
                        <FaUserPlus className="mr-3 h-5 w-5" />
                      )}
                      {isFollowing ? "Sever Connection" : "Sync Neural Net"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Enhanced Profile Details */}
            <div className="space-y-8">
              <div>
                <h1 className={`text-4xl md:text-5xl font-black mb-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className={`font-mono text-xs px-4 py-2 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-purple-300' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                    {profileAddress?.slice(0, 6)}...{profileAddress?.slice(-4)}
                  </p>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400' : 'bg-green-50 border-green-200 text-green-600'}`}>
                    <FaShield className="h-3.5 w-3.5" />
                    <span className="text-xs font-black uppercase tracking-widest">Verified Entity</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`text-center p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl'}`}
                  onClick={() => setActiveTab("posts")}
                >
                  <div className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-indigo-600'}`}>
                    {profile.postCount}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Broadcasts</div>
                </div>
                <div
                  className={`text-center p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl'}`}
                  onClick={() => setActiveTab("followers")}
                >
                  <div className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {profile.followerCount}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncs</div>
                </div>
                <div
                  className={`text-center p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/10 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl'}`}
                  onClick={() => setActiveTab("following")}
                >
                  <div className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`}>
                    {profile.followingCount}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Channels</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="glass-panel overflow-hidden">
          <div className={`border-b ${theme === 'dark' ? 'border-purple-500/10' : 'border-gray-100'}`}>
            <nav className="flex space-x-10 px-8 md:px-12">
              {[
                {
                  id: "posts",
                  label: "Broadcasts",
                  icon: FaComments,
                  count: profile.postCount,
                },
                {
                  id: "followers",
                  label: "Syncs",
                  icon: FaUsers,
                  count: profile.followerCount,
                },
                {
                  id: "following",
                  label: "Channels",
                  icon: FaHeart,
                  count: profile.followingCount,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 py-6 border-b-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id
                      ? theme === 'dark' ? "border-cyan-400 text-cyan-400" : "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] ${activeTab === tab.id
                        ? theme === 'dark' ? "bg-cyan-400/20 text-cyan-400" : "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === "posts" && (
              <div className="space-y-8">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard
                      key={`${post.postID}-${post.timeCreated}`}
                      post={post}
                      currentUser={currentUserAddress}
                      onPostUpdate={refreshPosts}
                      interaction={post.interaction}
                    />
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/20' : 'bg-gray-100'}`}>
                      <FaComments className={`h-12 w-12 ${theme === 'dark' ? 'text-purple-400/40' : 'text-gray-300'}`} />
                    </div>
                    <h3 className={`text-2xl font-black mb-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      No Broadcasts Detected
                    </h3>
                    <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "The network awaits your signal. Initiate your first broadcast to establish your presence."
                        : `${profile.name} has not transmitted any signals to the network yet.`}
                    </p>
                    {isOwnProfile && (
                      <Link
                        href="/"
                        className={`inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 mt-10 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                      >
                        <FaPaperPlane className="mr-3 h-4 w-4" />
                        Initiate First Broadcast
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "followers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.length > 0 ? (
                  followers.map((followerAddress) => (
                    <UserCard key={followerAddress} address={followerAddress} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FaUsers className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      No followers yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "Share great content and engage with the community to gain followers!"
                        : `${profile.name} doesn't have any followers yet.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "following" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.length > 0 ? (
                  following.map((followingAddress) => (
                    <UserCard
                      key={followingAddress}
                      address={followingAddress}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FaHeart className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Not following anyone
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "Discover amazing people and start building your network!"
                        : `${profile.name} isn't following anyone yet.`}
                    </p>
                    {isOwnProfile && (
                      <Link
                        href="/users"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mt-6"
                      >
                        <FaUsers className="mr-2 h-4 w-4" />
                        Discover People
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function UserCard({ address }) {
  const publicClient = usePublicClient();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (publicClient && address) {
        try {
          const profile = await contractService.getProfile(
            publicClient,
            address
          );
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [publicClient, address]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 animate-pulse border border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gray-200 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const { theme } = useTheme();
  return (
    <Link href={`/profile/${address}`}>
      <div className={`group rounded-[2rem] p-5 border transition-all duration-500 cursor-pointer overflow-hidden relative ${theme === 'dark' ? 'bg-white/5 border-purple-500/10 hover:bg-white/10 hover:border-purple-500/30 shadow-2xl shadow-purple-500/5' : 'bg-white border-gray-100 hover:shadow-xl'}`}>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 transform group-hover:rotate-3 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
              <span className="text-white font-black text-xl">
                {userProfile?.name
                  ? userProfile.name.charAt(0).toUpperCase()
                  : "?"}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${theme === 'dark' ? 'bg-green-400 border-[#1a1635]' : 'bg-green-500 border-white'}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-black tracking-tight truncate transition-colors ${theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-gray-900 group-hover:text-purple-600'}`}>
              {userProfile?.name || "Anonymous User"}
            </p>
            <p className={`text-[10px] font-black tracking-widest uppercase truncate mt-1 ${theme === 'dark' ? 'text-purple-400/60' : 'text-gray-400'}`}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaEye className={`h-5 w-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-purple-500'}`} />
          </div>
        </div>

        {/* Card background effect */}
        <div className={`absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/10 to-transparent' : 'bg-gradient-to-br from-purple-50 to-transparent'}`}></div>
      </div>
    </Link>
  );
}

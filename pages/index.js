import { useState, useEffect } from "react";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useRouter } from "next/router";
import Head from "next/head";

import { contractService } from "../lib/contract";

import { CONTRACT_ADDRESS } from "../lib/constants";

import { useUserProfile } from "../contexts/UserProfileContext";

import CreatePost from "../components/Posts/CreatePost";
import { useTheme } from "../contexts/ThemeContext";

import PostCard from "../components/Posts/PostCard";

import LoadingSpinner from "../components/UI/LoadingSpinner";

import {
  FaPlus,
  FaSync,
  FaRocket,
  FaUsers,
  FaHeart,
  FaComments,
  FaStar,
  FaFire,
  FaGlobe,
  FaSearch,
} from "react-icons/fa";

export default function Home() {
  const { address, isConnected } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [pagination, setPagination] = useState({
    offset: 0,     // Current offset in contract storage
    limit: 10,     // Number of posts to fetch per request
    total: 0,      // Total number of posts on-chain
    hasMore: false
  });

  const fetchPosts = async (reset = false) => {
    if (!publicClient) return;
    setLoading(true);

    console.log("Fetching posts...", {
      reset,
      offset: reset ? 0 : pagination.offset,
    });

    try {
      const offset = reset ? 0 : pagination.offset;
      const result = await contractService.getAllPosts(
        publicClient,
        offset,
        pagination.limit
      );

      console.log("Posts fetch result:", result);

      const newPosts = reset ? result.posts : [...posts, ...result.posts];
      setPosts([...newPosts].reverse());

      setPagination({
        offset: offset + result.posts.length,
        limit: pagination.limit,
        total: result.total,
        hasMore: offset + result.posts.length < result.total,
      });

      console.log("Updated posts state:", newPosts);
      console.log("Updated pagination:", {
        offset: offset + result.posts.length,
        total: result.total,
        hasMore: offset + result.posts.length < result.total,
      });

    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [publicClient]);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchPosts(true);
  };

  // Handler for loading more posts
  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchPosts(false);
    }
  };

  // Handler to manually refresh feed
  const handleRefresh = () => {
    fetchPosts(true);
  };

  return (
    <>
      <Head>
        <title>Liberty Social - Decentralized Social Media</title>
        <meta
          name="description"
          content="A decentralized social media platform built on blockchain"
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {!isConnected && (
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-600 to-cyan-600 rounded-[3rem] p-8 sm:p-14 text-white shadow-2xl glass-panel border-0">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] mb-8 shadow-2xl border border-white/20">
                <FaRocket className="h-12 w-12 text-cyan-300 animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  Liberty Social
                </span>
              </h1>
              <p className="text-xl sm:text-2xl opacity-80 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
                Step into the future of decentralized networking. Own your identity, your content, and your data.
              </p>
            </div>
          </div>
        )}

        {isConnected && !userProfile?.exists && (
          <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-3xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
            <div className="relative flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Complete your profile setup
                </h3>
                <p className="text-yellow-800 mb-4">
                  Create your profile to start posting and connecting with others.
                </p>
                <a href="/profile/setup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-2xl">
                  <FaPlus className="mr-2 h-4 w-4" />
                  Setup Profile
                </a>
              </div>
            </div>
          </div>
        )}

        {isConnected && userProfile?.exists && (
          <div className={`overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-300 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
            {showCreatePost ? (
              <div className="p-8">
                <CreatePost
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowCreatePost(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full text-left p-8 group transition-all duration-300 hover:bg-white/5"
              >
                <div className="flex items-center space-x-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                    {userProfile.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      What's on your mind?
                    </h3>
                    <p className="text-gray-500 font-medium">Share your thoughts with the community</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Latest Posts Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 pb-4">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FaFire className="h-7 w-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Latest Posts
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                {posts.length || "0"} Posts Syncing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => console.log("Debug Info:", { posts, pagination, userProfile })}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <FaSearch className="h-3 w-3" />
              <span>Raw Debug</span>
            </button>
            <button
              onClick={() => fetchPosts(true)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:bg-purple-600/30' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
            >
              <FaRocket className="h-3 w-3" />
              <span>Debug Fetch</span>
            </button>
            <button
              onClick={handleRefresh}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white text-black font-black shadow-xl hover:shadow-white/20' : 'bg-gray-900 text-white shadow-xl'}`}
            >
              <FaSync className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Debug Info Panel */}
        <div className={`rounded-3xl border p-6 overflow-hidden relative ${theme === 'dark' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Debug Info:</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className={`text-[10px] font-bold uppercase mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Posts:</p>
              <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{posts.length}</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Total:</p>
              <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pagination.total}</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Loading:</p>
              <p className={`text-sm font-black ${loading ? 'text-yellow-500' : 'text-green-500'}`}>{loading.toString()}</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Client:</p>
              <p className="text-sm font-black text-green-500">✅</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={`${post.postID}-${post.timeCreated}`}
              post={post}
              currentUser={address}
              onPostUpdate={handleRefresh}
            />
          ))}

          {pagination.hasMore && !loading && (
            <div className="text-center py-8">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl"
              >
                <FaGlobe className="mr-2 h-4 w-4" />
                Load More Posts
              </button>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16">
              <FaComments className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

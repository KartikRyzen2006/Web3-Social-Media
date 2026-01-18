import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePublicClient } from "wagmi";
import Head from "next/head";
import { FaSearch, FaUsers, FaComments, FaRocket, FaSpinner, FaArrowLeft, FaCompass, FaCrown } from "react-icons/fa";
import { contractService } from "../lib/contract";
import { useTheme } from "../contexts/ThemeContext";
import PostCard from "../components/Posts/PostCard";
import Link from "next/link";

export default function SearchPage() {
    const router = useRouter();
    const { q } = router.query;
    const { theme } = useTheme();
    const publicClient = usePublicClient();

    const [results, setResults] = useState({ users: [], posts: [], groups: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        if (q && publicClient) {
            handleSearch(q);
        }
    }, [q, publicClient]);

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            // Fetch users, posts, and group IDs concurrently
            const [userResult, postResult, groupIds] = await Promise.all([
                contractService.getAllUsers(publicClient, 0, 50),
                contractService.getAllPosts(publicClient, 0, 50),
                contractService.getAllGroupIds(publicClient)
            ]);

            // Fetch group details for all IDs
            const groupsData = await Promise.all(
                groupIds.map(async (groupId) => {
                    try {
                        const details = await contractService.getGroupDetails(publicClient, groupId);
                        return { id: groupId, ...details };
                    } catch (error) {
                        console.error(`Error fetching group ${groupId}:`, error);
                        return null;
                    }
                })
            );
            const validGroups = groupsData.filter(g => g !== null);

            // Filter Users
            // Note: getAllUsers returns objects with 'owner' property, not 'walletAddress'
            const filteredUsers = userResult.users.filter(u =>
                u.name?.toLowerCase().includes(query.toLowerCase()) ||
                u.owner?.toLowerCase().includes(query.toLowerCase())
            );

            // Filter Posts
            // Note: getAllPosts returns objects with 'postDescription' property
            const filteredPosts = postResult.posts.filter(p =>
                p.postDescription?.toLowerCase().includes(query.toLowerCase())
            );

            // Filter Groups
            const filteredGroups = validGroups.filter(g =>
                g.name?.toLowerCase().includes(query.toLowerCase()) ||
                g.description?.toLowerCase().includes(query.toLowerCase())
            );

            setResults({ users: filteredUsers, posts: filteredPosts, groups: filteredGroups });
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Head>
                <title>Search: {q} - Liberty Social</title>
            </Head>

            <div className="mb-8">
                <Link href="/" className="flex items-center text-gray-500 hover:text-purple-500 transition-colors mb-4">
                    <FaArrowLeft className="mr-2" /> Back
                </Link>
                <h1 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Search results for "<span className="text-purple-500">{q}</span>"
                </h1>
            </div>

            <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`pb-4 px-4 font-bold transition-all whitespace-nowrap ${activeTab === "users"
                        ? "text-purple-500 border-b-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Users ({results.users.length})
                </button>
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`pb-4 px-4 font-bold transition-all whitespace-nowrap ${activeTab === "posts"
                        ? "text-purple-500 border-b-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Posts ({results.posts.length})
                </button>
                <button
                    onClick={() => setActiveTab("groups")}
                    className={`pb-4 px-4 font-bold transition-all whitespace-nowrap ${activeTab === "groups"
                        ? "text-purple-500 border-b-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Groups ({results.groups.length})
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="h-12 w-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-gray-500">Searching the mesh...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.users.map((user) => (
                                <Link
                                    key={user.owner}
                                    href={`/profile/${user.owner}`}
                                    className={`p-6 rounded-3xl border transition-all ${theme === 'dark'
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white border-gray-200 hover:shadow-xl'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-black">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                                            <p className="text-xs text-gray-500 truncate w-32">{user.owner}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {results.users.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <FaUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No entities found in this sector.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Posts Tab */}
                    {activeTab === "posts" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {results.posts.map((post) => (
                                <PostCard key={post.postID} post={post} />
                            ))}
                            {results.posts.length === 0 && (
                                <div className="py-20 text-center">
                                    <FaComments className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No data fragments found for this query.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Groups Tab */}
                    {activeTab === "groups" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.groups.map((group) => (
                                <Link
                                    key={group.id}
                                    href={`/groups/${group.id}`}
                                    className={`p-6 rounded-3xl border transition-all ${theme === 'dark'
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white border-gray-200 hover:shadow-xl'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                            <FaCompass className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-lg">
                                                    {group.memberCount} Units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {group.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>ID: #{group.id}</span>
                                        <div className="flex items-center gap-1">
                                            <FaCrown className="h-3 w-3 text-yellow-500" />
                                            <span>{group.creator?.slice(0, 6)}...</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {results.groups.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <FaCompass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No synchronized clusters found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import Link from "next/link";
import { FaComments, FaUsers, FaPlus, FaSearch, FaUserCircle, FaCircle } from "react-icons/fa";
import LoadingSpinner from "../UI/LoadingSpinner";

const ConversationSidebar = ({
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    filteredUsers,
    filteredGroups,
    selectedConversation,
    setSelectedConversation,
    onStartDirectMessage,
    onShowNewMessageModal,
    theme
}) => {
    const isDark = theme === 'dark';

    return (
        <div
            className={`w-full md:w-80 border-r flex flex-col backdrop-blur-sm transition-all duration-500 ${isDark ? "bg-[#0d0b1c]/80 border-blue-500/20" : "bg-white/50 border-gray-100"
                } ${selectedConversation ? "hidden md:flex" : "flex"}`}
        >
            {/* Sidebar Header */}
            <div className={`p-6 border-b ${isDark ? "border-blue-500/10 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" : "border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50"}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:rotate-6 ${isDark ? "bg-[#0d0b1c] border border-purple-500/20 cyber-glow-sm" : "bg-gradient-to-br from-blue-500 to-purple-600"
                            }`}>
                            <FaComments className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-gray-900"}`}>Messages</h1>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-purple-400" : "text-gray-600"}`}>Entity Sync</p>
                        </div>
                    </div>
                    <button
                        onClick={onShowNewMessageModal}
                        className={`p-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 ${isDark ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white cyber-glow-sm" : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
                            }`}
                    >
                        <FaPlus className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex space-x-2 rounded-2xl p-1.5 border ${isDark ? "bg-black/40 border-white/5" : "bg-white/60 border-white/40"
                    }`}>
                    <button
                        onClick={() => setActiveTab("direct")}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "direct"
                                ? isDark
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 cyber-glow-sm"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                : isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                            }`}
                    >
                        <FaComments className="h-3.5 w-3.5" />
                        <span>Direct</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("groups")}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "groups"
                                ? isDark
                                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 cyber-glow-sm"
                                    : "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                                : isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                            }`}
                    >
                        <FaUsers className="h-3.5 w-3.5" />
                        <span>Groups</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={`p-4 border-b ${isDark ? "border-blue-500/10" : "border-gray-100"}`}>
                <div className="relative group">
                    <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${isDark ? "text-purple-500/50 group-focus-within:text-cyan-400" : "text-gray-400 group-focus-within:text-blue-500"
                        }`} />
                    <input
                        type="text"
                        placeholder={`SEARCH ${activeTab === "direct" ? "ENTITY" : "NODE"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-1 ${isDark
                                ? "bg-black/40 border-white/5 text-white placeholder-gray-700 focus:border-purple-500/50 focus:ring-purple-500/20"
                                : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                            }`}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${isDark ? "bg-white/5 cyber-glow-sm" : "bg-gradient-to-br from-blue-500 to-purple-500"
                            }`}>
                            <LoadingSpinner size="md" />
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-600" : "text-gray-400"}`}>Syncing data...</p>
                    </div>
                ) : (
                    <div className="space-y-2 p-4">
                        {activeTab === "direct" ? (
                            filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.owner}
                                        onClick={() => onStartDirectMessage(user.owner)}
                                        className={`w-full flex items-center space-x-4 p-4 rounded-[1.5rem] transition-all duration-300 text-left group ${selectedConversation?.address === user.owner
                                                ? isDark
                                                    ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 shadow-lg shadow-purple-500/5"
                                                    : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-lg"
                                                : "hover:scale-[1.02]"
                                            } ${isDark ? "hover:bg-white/5" : "hover:bg-white/60"}`}
                                    >
                                        <div className="relative">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500 ${isDark
                                                    ? "bg-[#0d0b1c] border border-purple-500/20 cyber-glow-sm"
                                                    : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600"
                                                }`}>
                                                <span className="text-white font-black text-lg">
                                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDark ? "bg-cyan-500 border-[#0d0b1c] animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-green-500 border-white"}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-black uppercase tracking-[0.1em] text-xs truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {user.name || "Unknown User"}
                                            </p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-md ${isDark ? "bg-black/40 text-gray-500 border border-white/5" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {user.owner.slice(0, 6)}...{user.owner.slice(-4)}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                                        <FaUserCircle className={`h-8 w-8 ${isDark ? "text-gray-700" : "text-gray-400"}`} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-500"}`}>No entities found</p>
                                </div>
                            )
                        ) : filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() =>
                                        setSelectedConversation({
                                            type: "group",
                                            id: group.id,
                                            name: group.name,
                                            memberCount: group.memberCount,
                                        })
                                    }
                                    className={`w-full flex items-center space-x-4 p-4 rounded-[1.5rem] transition-all duration-300 text-left group ${selectedConversation?.id === group.id
                                            ? isDark
                                                ? "bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                                                : "bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 shadow-lg"
                                            : "hover:scale-[1.02]"
                                        } ${isDark ? "hover:bg-white/5" : "hover:bg-white/60"}`}
                                >
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500 ${isDark
                                            ? "bg-[#0d0b1c] border border-cyan-500/20 cyber-glow-sm"
                                            : "bg-gradient-to-br from-green-500 to-blue-500"
                                        }`}>
                                        <FaUsers className="text-white h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black uppercase tracking-[0.1em] text-xs truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {group.name}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-green-500"}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-500"}`}>{group.memberCount} NODES</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                                    <FaUsers className={`h-8 w-8 ${isDark ? "text-gray-700" : "text-gray-400"}`} />
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? "text-gray-600" : "text-gray-500"}`}>No nodes detected</p>
                                <Link
                                    href="/groups"
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? "text-purple-400 hover:text-cyan-400" : "text-blue-600 hover:text-blue-800"}`}
                                >
                                    JOIN CLUSTER →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationSidebar;

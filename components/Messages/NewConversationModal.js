import { FaRocket, FaTimes, FaUserCircle, FaComments } from "react-icons/fa";

const NewConversationModal = ({ isOpen, onClose, users, onStartDirectMessage, theme }) => {
    if (!isOpen) return null;

    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500"
                    onClick={onClose}
                />
                <div className={`inline-block align-bottom rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border animate-in slide-in-from-bottom-8 duration-500 ${isDark
                        ? "bg-[#0d0b1c]/95 border-white/10 cyber-glow"
                        : "bg-white/95 backdrop-blur-xl border-white/20"
                    }`}>
                    {/* Modal Header */}
                    <div className={`px-8 pt-8 pb-6 border-b ${isDark ? "border-blue-500/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" : "bg-gradient-to-r from-blue-50 to-purple-50 border-white/20"
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:rotate-6 duration-500 ${isDark ? "bg-[#0d0b1c] border border-purple-500/20 cyber-glow-sm" : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                                    }`}>
                                    <FaRocket className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-gray-900"}`}>
                                        New Sync
                                    </h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-purple-400" : "text-gray-600"}`}>
                                        Select Entity Node
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-3 rounded-2xl transition-all duration-300 ${isDark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                                    }`}
                            >
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="px-8 py-8">
                        <div className="space-y-3 max-h-80 overflow-y-auto hide-scrollbar pr-2">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <button
                                        key={user.owner}
                                        onClick={() => onStartDirectMessage(user.owner)}
                                        className={`w-full flex items-center space-x-4 p-5 rounded-[1.8rem] transition-all duration-500 text-left border group ${isDark
                                                ? "bg-white/5 border-white/5 hover:border-purple-500/30 hover:bg-white/10 shadow-lg hover:shadow-purple-500/5 hover:scale-[1.02]"
                                                : "bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 hover:shadow-lg border-gray-100"
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${isDark
                                                    ? "bg-[#0d0b1c] border border-cyan-500/20 cyber-glow-sm"
                                                    : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600"
                                                }`}>
                                                <span className="text-white font-black text-lg">
                                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDark ? "bg-cyan-500 border-[#0d0b1c] shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-green-500 border-white"
                                                }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-black uppercase tracking-[0.15em] text-xs ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {user.name}
                                            </p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 inline-block px-3 py-1 rounded-lg ${isDark ? "bg-black/40 text-gray-500 border border-white/5" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {user.owner.slice(0, 6)}...{user.owner.slice(-4)}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                                            <FaComments className={`h-5 w-5 ${isDark ? "text-cyan-400 cyber-glow-sm" : "text-blue-500"}`} />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-white/5 cyber-border" : "bg-gray-100"}`}>
                                        <FaUserCircle className={`h-10 w-10 ${isDark ? "text-gray-700" : "text-gray-400"}`} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>No detectable entities</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className={`px-8 py-6 border-t ${isDark ? "border-blue-500/10 bg-black/40" : "bg-gray-50/50 border-gray-100"
                        }`}>
                        <button
                            onClick={onClose}
                            className={`w-full px-8 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 ${isDark
                                    ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Terminate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewConversationModal;

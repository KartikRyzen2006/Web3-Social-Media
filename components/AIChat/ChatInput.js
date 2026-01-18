import { FaPaperPlane, FaMicrophone, FaBolt, FaPlus } from "react-icons/fa";

const ChatInput = ({ input, setInput, handleSend, isLoading, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-t transition-all duration-500 rounded-b-[2.5rem] ${isDark ? "bg-black/80 border-white/5" : "bg-white/80 border-gray-100"
            }`}>
            <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center space-x-2">
                        <button
                            type="button"
                            className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? "bg-white/5 border-white/5 text-gray-500 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <FaPlus className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? "bg-white/5 border-white/5 text-gray-500 hover:text-cyan-400" : "bg-gray-100 border-gray-200 text-gray-400 hover:text-blue-600"
                                }`}
                        >
                            <FaMicrophone className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="ENTER_QUERY_FOR_NEURAL_CORE..."
                            className={`w-full px-8 py-5 text-sm font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 rounded-[1.5rem] ${isDark
                                    ? "bg-[#0d0b1c] border-white/5 text-white placeholder-gray-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 shadow-inner"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 shadow-sm"
                                }`}
                        />
                        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest pointer-events-none transition-opacity duration-300 ${input ? 'opacity-0' : 'opacity-100'
                            } ${isDark ? "bg-white/5 text-gray-700" : "bg-gray-50 text-gray-300"}`}>
                            <FaBolt className="h-2 w-2 mr-1" /> CORE_SYNCED
                        </div>
                        {isDark && <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>}
                    </div>

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={`px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 disabled:grayscale ${isDark
                                ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white cyber-glow-sm"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                            }`}
                    >
                        {isLoading ? "SYNCING..." : "COMMIT_SYNC"}
                    </button>
                </div>
                <p className={`text-[8px] font-black uppercase tracking-[0.4em] text-center mt-6 transition-all duration-500 ${isDark ? "text-gray-800 group-focus-within:text-cyan-900" : "text-gray-300"}`}>
                    GEMINI_PRO_ENGINEERED • SECURE_NEURAL_PROTOCOL_ENABLED • v2.0
                </p>
            </form>
        </div>
    );
};

export default ChatInput;

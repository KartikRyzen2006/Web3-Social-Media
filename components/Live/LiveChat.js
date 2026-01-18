import { FaComment, FaPaperPlane } from "react-icons/fa";

const LiveChat = ({
    chatMessages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    address,
    chatBottomRef,
    theme
}) => {
    const isDark = theme === 'dark';

    return (
        <div className={`border-t transition-all duration-500 overflow-hidden ${isDark ? "bg-[#0d0b1c] border-white/5" : "bg-white border-gray-200"
            }`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                }`}>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? "text-cyan-400" : "text-gray-800"}`}>
                    <FaComment className={isDark ? "text-cyan-400" : "text-blue-500"} />
                    COM_LAYER_PROTOCOL
                </h3>
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${isDark ? "border-cyan-500/30 text-cyan-400/70" : "text-gray-400 border-gray-200"
                    }`}>
                    {chatMessages.length} PACKETS
                </span>
            </div>

            <div className={`h-80 overflow-y-auto p-6 space-y-6 hide-scrollbar relative ${isDark ? "bg-[#0d0b1c]/40 bg-[url('/grid.svg')] bg-[length:40px_40px]" : "bg-white/50"
                }`}>
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-1000">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"
                            }`}>
                            <FaComment className={`h-6 w-6 ${isDark ? "text-gray-800" : "text-gray-400"}`} />
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                            CHANNEL_SILENT. INITIALIZE_SYNC_GREETING...
                        </p>
                    </div>
                ) : (
                    chatMessages.map((msg, idx) => (
                        <div key={idx} className="flex flex-col animate-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${msg.user === address
                                        ? isDark ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-blue-100 text-blue-700"
                                        : isDark ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-100 text-purple-700"
                                    }`}>
                                    NODE://{msg.user && msg.user.slice(0, 4)}...{msg.user && msg.user.slice(-4)}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.user === address && <div className={`w-1 h-1 rounded-full ${isDark ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "bg-blue-400"}`}></div>}
                            </div>
                            <div className={`relative px-4 py-3 rounded-[1.2rem] rounded-tl-none border transition-all duration-300 ${isDark
                                    ? "bg-white/5 border-white/5 text-gray-300 font-medium"
                                    : "bg-gray-100 border-gray-200 text-gray-800"
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                {isDark && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none rounded-[1.2rem]"></div>}
                            </div>
                        </div>
                    ))
                )}
                <div ref={chatBottomRef} />
                {isDark && <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>}
            </div>

            {/* Chat Input */}
            <div className={`p-6 border-t ${isDark ? "bg-black/80 border-white/5" : "bg-gray-50 border-gray-200"
                }`}>
                {address ? (
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="ENTER PACKET DATA..."
                                className={`w-full px-8 py-4 text-xs font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 rounded-[1.5rem] ${isDark
                                        ? "bg-[#0d0b1c] border-white/5 text-white placeholder-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/20 shadow-inner"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                                    }`}
                            />
                            {isDark && <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>}
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className={`p-4 rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-110 active:scale-90 disabled:opacity-20 disabled:hover:scale-100 ${isDark
                                    ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white cyber-glow-sm"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            <FaPaperPlane className="h-4 w-4" />
                        </button>
                    </form>
                ) : (
                    <div className={`text-center p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-dashed ${isDark ? "bg-white/5 border-purple-500/30 text-purple-400" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
                        UPLINK_DENIED: AUTH_REQUIRED_FOR_LAYER_COM
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChat;

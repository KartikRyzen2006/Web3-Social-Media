import { FaRobot, FaUserAlt, FaTerminal } from "react-icons/fa";

const MessageList = ({ messages, isLoading, chatEndRef, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar min-h-[500px] relative ${isDark ? "bg-[#0d0b1c]/40 bg-[url('/grid.svg')] bg-[length:50px_50px]" : "bg-white/50"
            }`}>
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                    <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-500 hover:rotate-12 ${isDark ? "bg-[#0d0b1c] border-2 border-cyan-500/30 cyber-glow" : "bg-gradient-to-br from-cyan-400 to-blue-600"
                        }`}>
                        <FaRobot className={`h-16 w-16 ${isDark ? "text-cyan-400" : "text-white"}`} />
                    </div>
                    <div className="space-y-3">
                        <h3 className={`text-2xl font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-gray-900"}`}>
                            INITIALIZE_NEURAL_LINK
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                            Secure encrypted protocol established. Neural Core is ready for data processing. Enter query or select suggested node below.
                        </p>
                    </div>
                </div>
            ) : (
                messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-6 duration-500`}>
                        <div className={`flex items-center space-x-3 mb-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${msg.type === 'ai'
                                    ? isDark ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-blue-100 border-blue-200 text-blue-600"
                                    : isDark ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-purple-100 border-purple-200 text-purple-600"
                                }`}>
                                {msg.type === 'ai' ? <FaRobot className="h-5 w-5" /> : <FaUserAlt className="h-4 w-4" />}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                                {msg.type === 'ai' ? "CORE_OUTPUT" : "NODE_INPUT"}
                            </span>
                        </div>

                        <div className={`relative max-w-[85%] px-7 py-5 rounded-[2rem] border transition-all duration-500 ${msg.type === 'ai'
                                ? isDark
                                    ? "bg-white/5 border-white/5 text-cyan-50 rounded-tl-none shadow-[inset_0_0_20px_rgba(34,211,238,0.02)]"
                                    : "bg-blue-50/50 border-blue-100 text-blue-900 rounded-tl-none shadow-sm"
                                : isDark
                                    ? "bg-[#0d0b1c] border-purple-500/30 text-white rounded-tr-none shadow-2xl"
                                    : "bg-gray-900 text-white rounded-tr-none shadow-xl"
                            }`}>
                            <div className="text-sm message-content leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                            </div>
                            {msg.type === 'ai' && isDark && (
                                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-tl-none"></div>
                            )}
                        </div>
                    </div>
                ))
            )}

            {isLoading && (
                <div className="flex items-start space-x-3 animate-pulse">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDark ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-blue-100 border-blue-200"
                        }`}>
                        <FaTerminal className="h-4 w-4" />
                    </div>
                    <div className={`px-6 py-4 rounded-[1.5rem] rounded-tl-none border ${isDark ? "bg-white/5 border-white/5 text-cyan-400/50" : "bg-gray-100 border-gray-200"
                        }`}>
                        <div className="flex space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={chatEndRef} />
            {isDark && <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]"></div>}
        </div>
    );
};

export default MessageList;

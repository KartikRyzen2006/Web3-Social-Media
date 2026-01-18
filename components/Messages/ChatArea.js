import Link from "next/link";
import { FaArrowLeft, FaUsers, FaCircle, FaComments, FaSpinner, FaPaperPlane, FaTimes } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import { LIMITS } from "../../lib/constants";

const ChatArea = ({
    selectedConversation,
    setSelectedConversation,
    messages,
    messagesEndRef,
    address,
    senderProfiles,
    formatTimeAgo,
    getSenderName,
    replyTo,
    setReplyTo,
    handleDeleteMessage,
    newMessage,
    setNewMessage,
    handleSendMessage,
    sendingMessage,
    theme
}) => {
    const isDark = theme === 'dark';

    if (!selectedConversation) {
        return (
            <div className={`flex-1 flex items-center justify-center backdrop-blur-sm hidden md:flex ${isDark ? "bg-[#0d0b1c]/40" : "bg-gray-50/30"}`}>
                <div className="text-center max-w-md animate-in fade-in zoom-in duration-700">
                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transition-transform hover:scale-110 duration-500 ${isDark ? "bg-[#0d0b1c] border border-blue-500/20 cyber-glow" : "bg-gradient-to-br from-gray-200 to-gray-300"
                        }`}>
                        <FaComments className={`h-12 w-12 ${isDark ? "text-cyan-400" : "text-gray-400"}`} />
                    </div>
                    <h3 className={`text-2xl font-black uppercase tracking-[0.2em] mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Select Sync Protocol
                    </h3>
                    <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                        Choose a neural entity or community cluster from the access panel to initialize conversation synchronization.
                    </p>
                </div>
            </div>
        );
    }

    // Scroll to specific message
    const scrollToMessage = (index) => {
        const element = document.getElementById(`message-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add(isDark ? "bg-purple-500/20" : "bg-yellow-100/30");
            setTimeout(() => {
                element.classList.remove(isDark ? "bg-purple-500/20" : "bg-yellow-100/30");
            }, 2000);
        }
    };

    return (
        <div
            className={`flex-1 flex flex-col transition-all duration-500 ${selectedConversation ? "flex" : "hidden md:flex"
                }`}
        >
            {/* Chat Header */}
            <div className={`p-6 border-b backdrop-blur-md z-10 ${isDark ? "border-blue-500/10 bg-gradient-to-r from-[#0d0b1c]/90 to-black/90" : "border-gray-100 bg-white/80"
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSelectedConversation(null)}
                            className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${isDark ? "text-gray-400 hover:text-cyan-400 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-white/80"
                                }`}
                        >
                            <FaArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="relative">
                            <div
                                className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-500 ${isDark
                                        ? "bg-[#0d0b1c] border border-cyan-500/30 cyber-glow-sm"
                                        : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600"
                                    }`}
                            >
                                {selectedConversation.type === "direct" ? (
                                    <span className="text-white text-xl font-black uppercase">
                                        {selectedConversation.name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                ) : (
                                    <FaUsers className="text-white h-7 w-7" />
                                )}
                            </div>
                            {selectedConversation.type === "direct" && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${isDark ? "bg-cyan-500 border-[#0d0b1c] shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-green-500 border-white"
                                    }`}></div>
                            )}
                        </div>
                        <div>
                            <h2 className={`text-xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-gray-900"}`}>
                                {selectedConversation.name}
                            </h2>
                            {selectedConversation.type === "group" ? (
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isDark ? "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-green-500"}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                                        {selectedConversation.memberCount} NODES ACTIVE
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isDark ? "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse" : "bg-green-500"}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-cyan-400" : "text-green-600"}`}>
                                        SYNCED
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedConversation.type === "group" && (
                        <Link
                            href={`/groups/${selectedConversation.id}`}
                            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 transform hover:scale-105 active:scale-95 ${isDark
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white cyber-glow-sm"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                }`}
                        >
                            Protocol Details
                        </Link>
                    )}
                </div>
            </div>

            {/* Messages List */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar ${isDark ? "bg-[#0d0b1c]/20 bg-[url('/grid.svg')] bg-[length:50px_50px]" : "bg-gradient-to-b from-gray-50/30 to-white/30"
                }`}>
                {messages.length > 0 ? (
                    messages.map((message, index) => {
                        const isOwnMessage =
                            message?.sender?.toLowerCase() === address?.toLowerCase();
                        const senderProfile = senderProfiles[message.sender];
                        const repliedMessage =
                            message.replyToIndex >= 0 && messages[message.replyToIndex]
                                ? messages[message.replyToIndex]
                                : null;

                        return (
                            <MessageBubble
                                key={`${message.timestamp}-${index}`}
                                message={message}
                                index={index}
                                isOwnMessage={isOwnMessage}
                                senderProfile={senderProfile}
                                repliedMessage={repliedMessage}
                                formatTimeAgo={formatTimeAgo}
                                getSenderName={getSenderName}
                                onReply={setReplyTo}
                                onDelete={handleDeleteMessage}
                                onScrollToMessage={scrollToMessage}
                                theme={theme}
                            />
                        );
                    })
                ) : (
                    <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform hover:rotate-12 duration-500 ${isDark ? "bg-white/5 cyber-border cyber-glow-sm" : "bg-gradient-to-br from-gray-200 to-gray-300"
                            }`}>
                            <FaComments className={`h-10 w-10 ${isDark ? "text-purple-500/50" : "text-gray-400"}`} />
                        </div>
                        <h3 className={`text-xl font-black uppercase tracking-widest mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            No Data Packets
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-600" : "text-gray-500"}`}>
                            Initialize transmission to start synchronization.
                        </p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-6 border-t backdrop-blur-md relative ${isDark ? "border-blue-500/10 bg-black/80" : "border-gray-100 bg-white/80"
                }`}>
                {replyTo && (
                    <div className={`mb-4 p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 ${isDark ? "bg-purple-500/5 border-purple-500/30 shadow-lg shadow-purple-500/5" : "bg-gray-50 border-gray-200"
                        }`}>
                        <div className="flex-1 min-w-0 pr-4">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? "text-cyan-400" : "text-blue-600"}`}>
                                REPLY_TO://{getSenderName(replyTo.message.sender)}
                            </p>
                            <p className={`text-sm truncate ${isDark ? "text-gray-400 font-medium" : "text-gray-600"}`}>
                                {replyTo.message.content}
                            </p>
                        </div>
                        <button
                            onClick={() => setReplyTo(null)}
                            className={`p-1.5 rounded-full transition-all duration-300 ${isDark ? "hover:bg-white/10 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-400"}`}
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex space-x-4">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                            placeholder="ENTER PACKET CONTENT..."
                            maxLength={LIMITS.maxMessageLength}
                            className={`w-full px-8 py-5 text-sm font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 ${isDark
                                    ? "bg-[#0d0b1c] border-white/5 text-white placeholder-gray-700 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    : "bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                                } rounded-[1.5rem] shadow-inner`}
                            disabled={sendingMessage}
                        />
                        {isDark && <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-purple-500/5 to-cyan-500/5 pointer-events-none"></div>}
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                        className={`px-8 py-5 rounded-[1.5rem] transition-all duration-500 shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 ${isDark
                                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white cyber-glow-sm"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl"
                            }`}
                    >
                        {sendingMessage ? (
                            <FaSpinner className="animate-spin h-5 w-5" />
                        ) : (
                            <FaPaperPlane className="h-5 w-5" />
                        )}
                    </button>
                </div>
                {isDark && <div className="absolute -top-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>}
            </div>
        </div>
    );
};

export default ChatArea;

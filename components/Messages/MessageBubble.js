import Link from "next/link";
import { FaReply, FaTrash } from "react-icons/fa";

const MessageBubble = ({
    message,
    index,
    isOwnMessage,
    senderProfile,
    repliedMessage,
    formatTimeAgo,
    getSenderName,
    onReply,
    onDelete,
    onScrollToMessage,
    theme
}) => {
    const isDark = theme === 'dark';

    return (
        <div
            id={`message-${index}`}
            className={`flex group transition-all duration-700 rounded-3xl ${isOwnMessage ? "justify-end" : "justify-start"
                }`}
        >
            <div className={`flex flex-col max-w-[85%] lg:max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
                {/* Sender Name for Groups or Direct */}
                {!isOwnMessage && (
                    <Link
                        href={`/profile/${message.sender}`}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-4 transition-all duration-300 flex items-center space-x-2 ${isDark ? "text-gray-500 hover:text-cyan-400" : "text-gray-500 hover:text-blue-600"
                            }`}
                    >
                        <span className="font-black">
                            {senderProfile?.name || "Unknown"}
                        </span>
                        <span className="opacity-40 text-[8px]">
                            [{message.sender.slice(0, 6)}...{message.sender.slice(-4)}]
                        </span>
                    </Link>
                )}

                {/* Actions (Reply/Delete) */}
                <div
                    className={`flex items-center space-x-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                >
                    <button
                        onClick={() => onReply({ message, index })}
                        className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/5 text-gray-500 hover:text-cyan-400 hover:bg-white/10" : "hover:bg-gray-100 text-gray-500"
                            }`}
                        title="Reply"
                    >
                        <FaReply className="w-3 h-3" />
                    </button>
                    {isOwnMessage && !message.isDeleted && (
                        <button
                            onClick={() => onDelete(index)}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/5 text-gray-400 hover:text-red-500 hover:bg-white/10" : "hover:bg-gray-100 text-red-500"
                                }`}
                            title="Unsend"
                        >
                            <FaTrash className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Message Bubble containing Reply Context */}
                <div
                    className={`px-5 py-4 rounded-[1.8rem] shadow-xl backdrop-blur-md transition-all duration-300 relative border ${message.isDeleted
                            ? isDark
                                ? "bg-white/5 text-gray-600 border-white/5 italic"
                                : "bg-gray-100 text-gray-400 border border-gray-200 italic"
                            : isOwnMessage
                                ? isDark
                                    ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 text-white border-purple-500/30 cyber-glow-sm shadow-purple-500/10"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                : isDark
                                    ? "bg-[#1a1836]/60 text-gray-200 border-white/10 shadow-black/20"
                                    : "bg-white text-gray-900 border border-white/40 shadow-lg shadow-gray-200/50"
                        } ${isOwnMessage ? "rounded-tr-none" : "rounded-tl-none"}`}
                >
                    {/* Reply Context INSIDE Bubble */}
                    {repliedMessage && !message.isDeleted && (
                        <div
                            onClick={() => onScrollToMessage(message.replyToIndex)}
                            className={`mb-3 px-4 py-3 rounded-2xl text-[10px] font-medium backdrop-blur-md cursor-pointer hover:opacity-80 transition-all duration-300 border-l-4 ${isOwnMessage
                                    ? isDark
                                        ? "bg-black/40 text-white/90 border-cyan-400 shadow-inner"
                                        : "bg-black/20 text-white/90 border-white/50"
                                    : isDark
                                        ? "bg-black/40 text-gray-400 border-purple-500 shadow-inner"
                                        : "bg-gray-100 text-gray-600 border-blue-500"
                                }`}
                        >
                            <p className={`font-black uppercase tracking-widest mb-1 ${isDark ? "text-cyan-400" : ""}`}>
                                {getSenderName(repliedMessage.sender)}
                            </p>
                            <p className="truncate opacity-70 font-medium">
                                {repliedMessage.isDeleted
                                    ? "🚫 Packet Cleared"
                                    : repliedMessage.content}
                            </p>
                        </div>
                    )}

                    <p className={`leading-relaxed whitespace-pre-wrap break-words text-[14px] ${isDark && !isOwnMessage ? "font-medium" : "font-semibold"}`}>
                        {message.isDeleted
                            ? "🚫 SIGNAL_TERMINATED"
                            : message.content}
                    </p>

                    <div className="flex items-center justify-end space-x-2 mt-2">
                        <p
                            className={`text-[9px] font-black uppercase tracking-widest ${message.isDeleted
                                    ? "text-gray-600"
                                    : isOwnMessage
                                        ? "text-white/50"
                                        : isDark ? "text-gray-600" : "text-gray-400"
                                }`}
                        >
                            {formatTimeAgo(message.timestamp)}
                        </p>
                        {isOwnMessage && !message.isDeleted && <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "bg-white/50"}`}></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;

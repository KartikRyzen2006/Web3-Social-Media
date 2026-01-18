import { FaExternalLinkAlt } from "react-icons/fa";

const StreamInput = ({ videoUrl, onUrlChange, onToggleLive, isLive, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-b transition-all duration-500 ${isDark ? "bg-[#0d0b1c]/80 border-white/5" : "bg-gradient-to-r from-gray-50/50 to-white/50 border-gray-100"
            }`}>
            <div className="max-w-4xl mx-auto space-y-4">
                <label
                    htmlFor="videoUrl"
                    className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center space-x-3 ${isDark ? "text-red-500" : "text-gray-600"
                        }`}
                >
                    <FaExternalLinkAlt className="h-4 w-4" />
                    <span>BROADCAST_UPLINK_PROTOCOL</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <input
                            id="videoUrl"
                            type="url"
                            value={videoUrl}
                            onChange={onUrlChange}
                            placeholder="PASTE YOUTUBE PROTOCOL URL..."
                            className={`w-full px-8 py-5 text-sm font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 rounded-[1.5rem] ${isDark
                                    ? "bg-black/40 border-white/5 text-white placeholder-gray-700 focus:border-red-500/50 focus:ring-red-500/20 shadow-inner"
                                    : "bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-red-500"
                                }`}
                        />
                        {isDark && <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>}
                    </div>
                    <button
                        onClick={onToggleLive}
                        className={`px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl transform hover:scale-105 active:scale-95 ${isLive
                                ? isDark
                                    ? "bg-red-500/10 text-red-500 border border-red-500/30 shadow-lg shadow-red-500/5"
                                    : "bg-red-600 text-white hover:bg-red-700"
                                : isDark
                                    ? "bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {isLive ? "TERMINATE_SYNC" : "INITIALIZE_SYNC"}
                    </button>
                </div>
                {!isLive && (
                    <p className={`text-[9px] font-black uppercase tracking-widest text-center mt-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                        AWAITING INPUT_STRING FOR SIGNAL_ACQUISITION
                    </p>
                )}
            </div>
        </div>
    );
};

export default StreamInput;

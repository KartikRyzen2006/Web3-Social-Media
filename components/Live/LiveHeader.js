import { FaVideo, FaWifi, FaCircle } from "react-icons/fa";

const LiveHeader = ({ isLive, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-b transition-all duration-500 rounded-t-[2.5rem] ${isDark ? "bg-gradient-to-r from-red-600/20 via-[#0d0b1c] to-indigo-600/20 border-white/5" : "bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 border-white/20"
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:rotate-6 ${isDark ? "bg-[#0d0b1c] border border-red-500/30 cyber-glow-sm" : "bg-white/20 backdrop-blur-sm shadow-white/10"
                        }`}>
                        <FaVideo className={`h-8 w-8 ${isDark ? "text-red-500" : "text-white"}`} />
                    </div>
                    <div>
                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isDark ? "text-white" : "text-white"}`}>
                            Neural Broadcast
                        </h1>
                        <div className={`flex items-center space-x-4 mt-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-red-400" : "text-white/80"}`}>
                            <span className="flex items-center gap-2">
                                <FaWifi className="h-4 w-4" /> DECENTRALIZED STREAM
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-green-400"}`}></span>
                            <span className="flex items-center gap-2">
                                P2P NODE CONNECTED
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {isLive && (
                        <div className={`flex items-center space-x-2 px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase animate-in zoom-in duration-500 ${isDark ? "bg-red-500/10 text-red-500 border border-red-500/30 cyber-glow-sm" : "bg-red-600 text-white shadow-lg"
                            }`}>
                            <FaCircle className="h-2 w-2 animate-pulse" />
                            <span>LIVE_SESS</span>
                        </div>
                    )}
                    <div className={`hidden sm:flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl border transition-all duration-300 ${isDark ? "bg-white/5 border-white/5 text-gray-400" : "bg-white/10 border-white/20 text-white"
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isDark ? "bg-cyan-400" : "bg-green-400"}`}></span>
                        <span>UPLINK_STABLE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveHeader;

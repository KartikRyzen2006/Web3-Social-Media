import { FaVideo, FaWifi, FaEye } from "react-icons/fa";

const ChannelList = ({ activeStream, isLive, isStreamer, videoUrl, onWatchStream, address, viewCount, streamQuality, extractVideoId, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-t transition-all duration-500 ${isDark ? "bg-[#0d0b1c]/80 border-white/5" : "bg-gray-50 border-gray-200 shadow-inner"
            }`}>
            <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-4 ${isDark ? "text-red-500" : "text-gray-800"}`}>
                <FaVideo className={isDark ? "text-red-500" : "text-red-600"} />
                AVAILABLE_NODES
            </h3>

            {activeStream && activeStream.isLive ? (
                <div
                    onClick={() => onWatchStream(activeStream)}
                    className={`relative overflow-hidden group border transition-all duration-500 cursor-pointer rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-8 ${isDark
                            ? "bg-white/5 border-white/5 hover:border-red-500/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-red-500/10"
                            : "bg-white border-gray-200 hover:shadow-xl hover:border-red-300"
                        }`}
                >
                    <div className="relative w-full md:w-64 aspect-video bg-black rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-2xl">
                        <img
                            src={`https://img.youtube.com/vi/${extractVideoId(activeStream.url)}/maxresdefault.jpg`}
                            alt="Thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                            onError={(e) => { e.target.src = `https://img.youtube.com/vi/${extractVideoId(activeStream.url)}/mqdefault.jpg`; }}
                        />
                        <div className={`absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isDark ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-red-600 text-white"
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span>LIVE</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className={`text-xl font-black uppercase tracking-widest transition-colors duration-300 line-clamp-2 ${isDark ? "text-white group-hover:text-red-400" : "text-gray-900 group-hover:text-red-600"
                                }`}>
                                {activeStream.title}
                            </h4>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                                PROTO_ORIGIN: <span className={isDark ? "text-cyan-400/70" : "text-blue-600"}>{activeStream.streamerAddress ? activeStream.streamerAddress.slice(0, 8) + "..." + activeStream.streamerAddress.slice(-8) : "UNKNOWN_NODE"}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <FaEye className={isDark ? "text-red-500/50" : "text-gray-400"} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-600"}`}>{viewCount} SYNCING</span>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${isDark ? "bg-white/5 border-white/5 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"
                                }`}>
                                {streamQuality}
                            </div>
                        </div>

                        <button className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 transform group-hover:scale-105 active:scale-95 ${isDark
                                ? "bg-gradient-to-r from-red-600 to-indigo-600 text-white cyber-glow-sm"
                                : "bg-red-600 text-white shadow-lg"
                            }`}>
                            INITIALIZE_WATCH
                        </button>
                    </div>

                    {isDark && <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>}
                </div>
            ) : (
                isLive && isStreamer ? (
                    <div className={`rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border transition-all duration-500 animate-in zoom-in duration-700 ${isDark ? "bg-red-500/5 border-red-500/20 text-red-100" : "bg-red-50 border-red-200 text-red-800"
                        }`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 ${isDark ? "bg-[#0d0b1c] border-red-500/30 cyber-glow-sm shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-white border-red-200"
                                }`}>
                                <FaWifi className="text-red-500 h-8 w-8 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-widest">UPLINK_TERMINATED</h4>
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 opacity-70 ${isDark ? "text-red-400" : ""}`}>
                                    Server lost signal state. Protocol re-broadcast required.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await fetch('/api/live/stats', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            action: 'start_stream',
                                            url: videoUrl,
                                            title: "Live Stream",
                                            userAddress: address
                                        }),
                                    });
                                    alert("Protocol Restored!");
                                } catch (e) { alert("FAIL: " + e.message); }
                            }}
                            className={`px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 transform hover:scale-105 active:scale-95 ${isDark ? "bg-red-600 text-white cyber-glow-sm" : "bg-red-600 text-white shadow-lg shadow-red-500/20"
                                }`}
                        >
                            RESTORE_UPSYNC
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] animate-in fade-in duration-1000">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"
                            }`}>
                            <FaVideo className={`h-8 w-8 ${isDark ? "text-gray-800" : "text-gray-300"}`} />
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                            NO_ACTIVE_UPLINKS_DETECTED. BE_THE_FIRST_NODE.
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default ChannelList;

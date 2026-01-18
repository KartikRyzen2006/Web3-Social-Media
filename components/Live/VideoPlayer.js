import { FaPlay, FaExpand, FaCompress, FaCog, FaEye, FaThumbsUp, FaUsers, FaHeart, FaShareAlt, FaComment, FaSignal, FaCircle, FaTimes } from "react-icons/fa";

const VideoPlayer = ({
    embedUrl,
    containerRef,
    iframeRef,
    isFullscreen,
    toggleFullscreen,
    showControls,
    setShowControls,
    viewCount,
    likeCount,
    handleLike,
    isLive,
    streamQuality,
    formatNumber,
    theme,
    onToggleLive,
    isStreamer
}) => {
    const isDark = theme === 'dark';

    const LiveIndicator = () => (
        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isDark ? "bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "bg-red-600 text-white"
            }`}>
            <FaCircle className="h-2 w-2 animate-pulse" />
            <span>LIVE</span>
        </div>
    );

    const QualityIndicator = () => (
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isDark ? "bg-black/40 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.2)]" : "bg-black/50 text-white border-white/20"
            }`}>
            <FaSignal className="h-3 w-3" />
            <span>{streamQuality}</span>
        </div>
    );

    if (!embedUrl) {
        return (
            <div className={`aspect-video flex items-center justify-center transition-all duration-700 ${isDark ? "bg-[#0d0b1c] bg-[url('/grid.svg')] bg-[length:60px_60px]" : "bg-gradient-to-br from-gray-100 to-gray-200"
                }`}>
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                    <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl transition-transform hover:scale-110 duration-500 ${isDark ? "bg-[#0d0b1c] border-2 border-red-500/30 cyber-glow" : "bg-gradient-to-r from-red-500 to-purple-500"
                        }`}>
                        <FaPlay className={`h-16 w-16 ml-2 ${isDark ? "text-red-500" : "text-white"}`} />
                    </div>
                    <div className="space-y-3">
                        <h3 className={`text-2xl font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-gray-900"}`}>
                            SIGNAL_READY
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto ${isDark ? "text-gray-600" : "text-gray-500"}`}>
                            Awaiting transmission link initialization. Enter neural uplink address to begin synchronization.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onClick={() => !showControls && setShowControls(true)}
            className={`relative overflow-hidden transition-all duration-700 w-full ${isFullscreen ? "h-screen" : "h-0"
                } ${isDark ? "bg-black border-y border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "bg-black"}`}
            style={{ paddingBottom: isFullscreen ? 0 : '56.25%', cursor: !showControls ? 'pointer' : 'default' }}
        >
            <iframe
                ref={iframeRef}
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Neural Stream"
            />

            {showControls && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between overflow-hidden">
                    {/* Top overlay */}
                    <div className="flex justify-between items-start pointer-events-auto animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center space-x-4">
                            {isLive && <LiveIndicator />}
                            <QualityIndicator />
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleFullscreen}
                                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isDark ? "bg-black/60 text-white border border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-black/50 text-white hover:bg-black/70"
                                    }`}
                            >
                                {isFullscreen ? <FaCompress className="h-5 w-5" /> : <FaExpand className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={() => setShowControls(false)}
                                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isDark ? "bg-black/60 text-white border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-black/50 text-white hover:bg-black/70"
                                    }`}
                                title="Hide Controls"
                            >
                                <FaCog className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom overlay */}
                    <div className="pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`p-6 rounded-[2rem] border backdrop-blur-md transition-all duration-500 ${isDark
                            ? "bg-black/60 border-white/10 shadow-2xl shadow-black/50"
                            : "bg-gradient-to-r from-black/60 to-black/40 border-white/20"
                            }`}>
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-3 group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${isDark ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-white/10"
                                            }`}>
                                            <FaEye className={`h-5 w-5 ${isDark ? "text-cyan-400" : "text-white"}`} />
                                        </div>
                                        <div>
                                            <span className={`block text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-white"}`}>
                                                {formatNumber(viewCount)}
                                            </span>
                                            <span className={`block text-[8px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-white/60"}`}>NODES ACTIVE</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleLike}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isDark ? "bg-red-500/10 border border-red-500/30" : "bg-white/10"
                                            }`}>
                                            <FaThumbsUp className={`h-5 w-5 ${isDark ? "text-red-500" : "text-white"}`} />
                                        </div>
                                        <div>
                                            <span className={`block text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-white"}`}>
                                                {formatNumber(likeCount)}
                                            </span>
                                            <span className={`block text-[8px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-white/60"}`}>UPLINK_LIKES</span>
                                        </div>
                                    </div>

                                    {isLive && (
                                        <div className="hidden lg:flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-purple-500/10 border border-purple-500/30" : "bg-white/10"
                                                }`}>
                                                <FaUsers className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-white"}`} />
                                            </div>
                                            <div>
                                                <span className={`block text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-white"}`}>SYNCED</span>
                                                <span className={`block text-[8px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-white/60"}`}>COM_LAYER</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button className={`p-4 rounded-2xl border transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? "bg-white/5 border-white/5 text-red-500 hover:bg-red-500/20 hover:border-red-500/50" : "bg-white/20 text-white border-white/20"
                                        }`}>
                                        <FaHeart className="h-5 w-5" />
                                    </button>
                                    <button className={`p-4 rounded-2xl border transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? "bg-white/5 border-white/5 text-cyan-500 hover:bg-cyan-500/20 hover:border-cyan-500/50" : "bg-white/20 text-white border-white/20"
                                        }`}>
                                        <FaShareAlt className="h-5 w-5" />
                                    </button>
                                    <button className={`p-4 rounded-2xl border transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? "bg-white/5 border-white/5 text-purple-500 hover:bg-purple-500/20 hover:border-purple-500/50" : "bg-white/20 text-white border-white/20"
                                        }`}>
                                        <FaComment className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowControls(false)}
                                        className={`p-4 rounded-2xl border transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500/50" : "bg-red-600/20 text-red-500 border-red-500/20 hover:bg-red-600/30"
                                            }`}
                                        title="Hide Banner"
                                    >
                                        <FaTimes className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scanline Effect */}
                    {isDark && <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] animate-pulse"></div>}
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;

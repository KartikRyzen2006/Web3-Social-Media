import { FaEye, FaThumbsUp, FaSignal, FaWifi } from "react-icons/fa";

const StatsPanel = ({ viewCount, likeCount, streamQuality, formatNumber, theme }) => {
    const isDark = theme === 'dark';

    const stats = [
        { label: "UPLINK_NODES", value: formatNumber(viewCount), icon: FaEye, color: "red" },
        { label: "SIGNAL_LIKES", value: formatNumber(likeCount), icon: FaThumbsUp, color: "blue" },
        { label: "STREAM_RES", value: streamQuality, icon: FaSignal, color: "green" },
        { label: "SYNC_STATUS", value: "STABLE", icon: FaWifi, color: "purple" }
    ];

    return (
        <div className={`p-8 border-t transition-all duration-500 ${isDark ? "bg-[#0d0b1c]/80 border-white/5" : "bg-gradient-to-r from-gray-50/80 to-white/80 border-gray-100"
            }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`relative p-6 rounded-[2rem] border transition-all duration-500 transform hover:scale-105 group overflow-hidden ${isDark
                            ? "bg-white/5 border-white/5 hover:border-white/20"
                            : "bg-white border-gray-100 shadow-lg shadow-gray-200/50"
                        }`}>
                        <stat.icon className={`h-6 w-6 mx-auto mb-4 transition-transform duration-500 group-hover:rotate-12 ${isDark ? `text-${stat.color}-500/70` : `text-${stat.color}-500`
                            }`} />
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}>
                            {stat.value}
                        </p>
                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${isDark ? "text-gray-600" : "text-gray-500"}`}>
                            {stat.label}
                        </p>
                        {isDark && (
                            <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-${stat.color}-500/10 to-transparent rounded-bl-full pointer-events-none`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsPanel;

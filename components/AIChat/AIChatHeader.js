import { FaRobot, FaBrain, FaCircle } from "react-icons/fa";

const AIChatHeader = ({ theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-b transition-all duration-500 rounded-t-[2.5rem] ${isDark ? "bg-[#0d0b1c] border-white/5" : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 border-white/20"
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:rotate-6 ${isDark ? "bg-[#0d0b1c] border border-cyan-500/30 cyber-glow-sm" : "bg-white/20 backdrop-blur-sm"
                        }`}>
                        <FaRobot className={`h-8 w-8 ${isDark ? "text-cyan-400" : "text-white"}`} />
                    </div>
                    <div>
                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isDark ? "text-white" : "text-white"}`}>
                            Neural Core
                        </h1>
                        <div className={`flex items-center space-x-4 mt-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-cyan-400" : "text-white/80"}`}>
                            <span className="flex items-center gap-2">
                                <FaBrain className="h-4 w-4" /> QUANTUM_INF_v2.0
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-green-400"}`}></span>
                            <span className="flex items-center gap-2 px-2 py-0.5 rounded border border-current opacity-70">
                                GEMINI_PRO_SYNC
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl border transition-all duration-300 ${isDark ? "bg-white/5 border-white/5 text-gray-400" : "bg-white/10 border-white/20 text-white"
                        }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-cyan-400" : "bg-green-400"}`}></span>
                        <span>OS_STABLE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatHeader;

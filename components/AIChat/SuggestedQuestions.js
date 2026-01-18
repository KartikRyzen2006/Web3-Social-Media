import { FaTerminal } from "react-icons/fa";

const SuggestedQuestions = ({ suggestions, onSelect, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`px-8 py-10 transition-all duration-500 overflow-hidden relative ${isDark ? "bg-[#0d0b1c]/80 border-t border-white/5" : "bg-gray-50/50 border-t border-gray-100"
            }`}>
            <div className="max-w-4xl mx-auto">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 ${isDark ? "text-cyan-500/50" : "text-gray-400"}`}>
                    <FaTerminal className="h-4 w-4" />
                    SUGGESTED_NEURAL_NODES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(q)}
                            className={`p-5 text-left rounded-[1.5rem] border transition-all duration-500 group animate-in slide-in-from-left duration-500 ${isDark
                                    ? "bg-white/5 border-white/5 hover:border-cyan-500/30 hover:bg-white/10"
                                    : "bg-white border-gray-100 hover:border-blue-400 hover:shadow-lg shadow-gray-200/50"
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0d0b1c] text-gray-700 group-hover:text-cyan-400" : "bg-blue-50 text-blue-300 group-hover:text-blue-500"
                                    }`}>
                                    <span className="text-[10px] font-black">{idx + 1}</span>
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-blue-700"
                                    }`}>
                                    {q}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            {isDark && <div className="absolute -bottom-1 left-0 right-0 h-1 px-40 opacity-20"><div className="h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div></div>}
        </div>
    );
};

export default SuggestedQuestions;

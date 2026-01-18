import { FaBitcoin, FaChartLine, FaSearch } from "react-icons/fa";

const MarketHeader = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, stockSearchTerm, setStockSearchTerm, onStockSearch, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`p-8 border-b transition-all duration-500 rounded-t-[2.5rem] ${isDark ? "bg-[#0d0b1c]/80 border-white/5" : "bg-white/50 backdrop-blur-xl border-white/20 shadow-lg"
            }`}>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:rotate-6 ${isDark ? "bg-[#0d0b1c] border border-blue-500/30 cyber-glow-sm" : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/20"
                        }`}>
                        {activeTab === "crypto" ? <FaBitcoin className="h-8 w-8 text-white" /> : <FaChartLine className="h-8 w-8 text-white" />}
                    </div>
                    <div>
                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isDark ? "text-white" : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"}`}>
                            {activeTab === "crypto" ? "Neural Market" : "Asset Terminal"}
                        </h1>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${isDark ? "text-blue-400" : "text-gray-500"}`}>
                            {activeTab === "crypto" ? "NODE_STATUS: LIVE_CMC_FEED" : "NODE_STATUS: YAHOO_SYNC_ACTIVE"}
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className={`p-1.5 rounded-2xl flex items-center border transition-all duration-500 ${isDark ? "bg-black/40 border-white/5" : "bg-gray-100/80 border-gray-200"
                    }`}>
                    <button
                        onClick={() => { setActiveTab("crypto"); setSearchTerm(""); }}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "crypto"
                                ? isDark
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 cyber-glow-sm"
                                    : "bg-white text-blue-600 shadow-md"
                                : isDark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <FaBitcoin className="text-sm" /> <span>SYNC_CRYPTO</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("stocks"); setSearchTerm(""); }}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "stocks"
                                ? isDark
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 cyber-glow-sm"
                                    : "bg-white text-blue-600 shadow-md"
                                : isDark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <FaChartLine className="text-sm" /> <span>SYNC_ASSETS</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96 group">
                    {activeTab === "crypto" ? (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="SCAN ENTITY..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-14 pr-6 py-4 text-xs font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 rounded-[1.5rem] ${isDark
                                        ? "bg-black/40 border-white/5 text-white placeholder-gray-700 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-inner"
                                        : "bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-500 shadow-sm"
                                    }`}
                            />
                            <FaSearch className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-blue-500/50 group-focus-within:text-blue-400" : "text-gray-400 group-focus-within:text-blue-500"
                                }`} />
                        </div>
                    ) : (
                        <form onSubmit={onStockSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="SEARCH ASSET TICKET..."
                                    value={stockSearchTerm}
                                    onChange={(e) => setStockSearchTerm(e.target.value)}
                                    className={`w-full pl-14 pr-20 py-4 text-xs font-black uppercase tracking-widest transition-all duration-500 focus:outline-none focus:ring-1 rounded-[1.5rem] ${isDark
                                            ? "bg-black/40 border-white/5 text-white placeholder-gray-700 focus:border-purple-500/50 focus:ring-purple-500/20 shadow-inner"
                                            : "bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-500 shadow-sm"
                                        }`}
                                />
                                <button type="submit" className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isDark
                                        ? "bg-purple-600 text-white cyber-glow-sm hover:scale-105"
                                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    }`}>
                                    SYNC
                                </button>
                                <FaSearch className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-purple-500/50 group-focus-within:text-purple-400" : "text-gray-400 group-focus-within:text-blue-500"
                                    }`} />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketHeader;

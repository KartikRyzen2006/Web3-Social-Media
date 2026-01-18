import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const StockTable = ({ loading, filteredStocks, stockQuotes, formatCurrency, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`overflow-hidden transition-all duration-500 rounded-b-[2.5rem] border-t ${isDark ? "bg-[#0d0b1c]/40 border-white/5" : "bg-white/50 border-gray-100"
            }`}>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${isDark ? "border-white/5" : "bg-white/60 border-gray-100"}`}>
                            <th className={`px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>ASSET_ORIGIN</th>
                            <th className={`px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>TICKET_ID</th>
                            <th className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>VALUATION</th>
                            <th className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>DELTA_24H</th>
                            <th className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-500"}`}>SYNC_PROTOCOL</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-50"}`}>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className={`h-12 w-12 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                            <div className="space-y-2">
                                                <div className={`h-4 rounded w-32 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                                <div className={`h-3 rounded w-20 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><div className={`h-4 rounded w-16 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6"><div className={`h-4 rounded w-20 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6"><div className={`h-6 rounded-full w-16 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6"><div className={`h-4 rounded w-12 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                </tr>
                            ))
                        ) : filteredStocks.length > 0 ? (
                            filteredStocks.map((stock) => {
                                const quote = stockQuotes[stock.yahooSymbol] || {};
                                const price = quote.price;
                                const change = quote.changePercent;
                                const isPositive = change >= 0;

                                return (
                                    <tr key={stock.id} className={`transition-all duration-300 group ${isDark ? "hover:bg-white/5" : "hover:bg-purple-50/30"}`}>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <Link href={`/market/stock/${stock.id}`} className="flex items-center space-x-5 group">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 p-2 ${isDark ? "bg-[#0d0b1c] border border-white/10 cyber-glow-sm" : "bg-white shadow-md border border-gray-100"
                                                    }`}>
                                                    <img
                                                        className="h-full w-full object-contain"
                                                        src={stock.logo}
                                                        alt={stock.name}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/32?text=" + stock.symbol; }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? "text-white group-hover:text-purple-400" : "text-gray-900 group-hover:text-purple-600"}`}>
                                                        {stock.name}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-50 ${isDark ? "text-gray-200" : "text-gray-500"}`}>
                                                        {stock.exchange} • {stock.type}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className={`px-8 py-6 whitespace-nowrap text-sm font-black tracking-widest ${isDark ? "text-gray-400" : "text-gray-900"}`}>
                                            {stock.symbol}
                                        </td>
                                        <td className={`px-8 py-6 whitespace-nowrap text-right text-sm font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {price ? formatCurrency(price) : <span className="opacity-30 text-[10px]">SYNCING...</span>}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            {price ? (
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${isPositive
                                                        ? isDark
                                                            ? "bg-green-500/10 text-green-400 border-green-500/30 cyber-glow-sm"
                                                            : "bg-green-100 text-green-800 border-green-200"
                                                        : isDark
                                                            ? "bg-red-500/10 text-red-400 border-red-500/30 cyber-glow-sm"
                                                            : "bg-red-100 text-red-800 border-red-200"
                                                    }`}>
                                                    {isPositive ? "+" : ""}{change?.toFixed(2)}%
                                                </span>
                                            ) : <span className="opacity-10">-</span>}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <Link href={`/market/stock/${stock.id}`} className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isDark ? "text-purple-400 hover:text-white hover:cyber-glow-sm" : "text-blue-600 hover:text-blue-800"
                                                }`}>
                                                OPEN_NODE <FaArrowRight className="ml-3 h-2.5 w-2.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-24 text-center">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                        <FaArrowRight className={`h-8 w-8 rotate-90 ${isDark ? "text-gray-800" : "text-gray-300"}`} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                                        NO_DATA_PACKETS_MATCH_SECTOR_QUERY
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;

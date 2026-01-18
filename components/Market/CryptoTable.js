import Link from "next/link";
import { FaSort } from "react-icons/fa";

const CryptoTable = ({ loading, filteredCoins, handleSort, formatCurrency, theme }) => {
    const isDark = theme === 'dark';

    return (
        <div className={`overflow-hidden transition-all duration-500 rounded-b-[2.5rem] border-t ${isDark ? "bg-[#0d0b1c]/40 border-white/5" : "bg-white/50 border-gray-100"
            }`}>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${isDark ? "border-white/5" : "bg-white/60 border-gray-100"}`}>
                            <th
                                className={`px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer group transition-colors ${isDark ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                                onClick={() => handleSort("cmc_rank")}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>RANK</span>
                                    <FaSort className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
                                </div>
                            </th>
                            <th
                                className={`px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer group transition-colors ${isDark ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>ENTITY</span>
                                    <FaSort className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
                                </div>
                            </th>
                            <th
                                className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer group transition-colors ${isDark ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                                onClick={() => handleSort("price")}
                            >
                                <div className="flex items-center justify-end space-x-2">
                                    <span>VALUATION</span>
                                    <FaSort className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
                                </div>
                            </th>
                            <th
                                className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer group transition-colors ${isDark ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                                onClick={() => handleSort("percent_change_24h")}
                            >
                                <div className="flex items-center justify-end space-x-2">
                                    <span>DELTA_24H</span>
                                    <FaSort className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
                                </div>
                            </th>
                            <th
                                className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] hidden md:table-cell cursor-pointer group transition-colors ${isDark ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                                onClick={() => handleSort("market_cap")}
                            >
                                <div className="flex items-center justify-end space-x-2">
                                    <span>NET_WORTH</span>
                                    <FaSort className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-50"}`}>
                        {loading ? (
                            Array.from({ length: 15 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-6"><div className={`h-4 rounded w-8 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className={`h-10 w-10 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                            <div className="space-y-2">
                                                <div className={`h-4 rounded w-24 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                                <div className={`h-3 rounded w-12 ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><div className={`h-4 rounded w-20 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6"><div className={`h-6 rounded-full w-16 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                    <td className="px-8 py-6 hidden md:table-cell"><div className={`h-4 rounded w-28 ml-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`}></div></td>
                                </tr>
                            ))
                        ) : filteredCoins.length > 0 ? (
                            filteredCoins.map((coin) => (
                                <tr key={coin.id} className={`transition-all duration-300 group ${isDark ? "hover:bg-white/5" : "hover:bg-blue-50/30"}`}>
                                    <td className={`px-8 py-6 whitespace-nowrap text-[10px] font-black ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                                        #{coin.cmc_rank.toString().padStart(3, '0')}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <Link href={`/market/${coin.id}`} className="flex items-center space-x-5 group">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 p-0.5 ${isDark ? "bg-[#0d0b1c] border border-white/10 cyber-glow-sm" : "bg-white shadow-md border border-gray-100"
                                                }`}>
                                                <img
                                                    className="h-full w-full object-contain rounded-xl"
                                                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                                    alt={coin.name}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/32?text=?"; }}
                                                />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                                                    {coin.name}
                                                </div>
                                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 px-2 py-0.5 rounded-md inline-block ${isDark ? "bg-black/40 text-gray-500 border border-white/5" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {coin.symbol}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className={`px-8 py-6 whitespace-nowrap text-right text-sm font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {formatCurrency(coin.quote?.USD?.price || 0)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${(coin.quote?.USD?.percent_change_24h || 0) > 0
                                                ? isDark
                                                    ? "bg-green-500/10 text-green-400 border-green-500/30 cyber-glow-sm"
                                                    : "bg-green-100 text-green-800 border-green-200"
                                                : isDark
                                                    ? "bg-red-500/10 text-red-400 border-red-500/30 cyber-glow-sm"
                                                    : "bg-red-100 text-red-800 border-red-200"
                                            }`}>
                                            {(coin.quote?.USD?.percent_change_24h || 0) > 0 ? "+" : ""}
                                            {(coin.quote?.USD?.percent_change_24h || 0).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 whitespace-nowrap text-right text-[11px] font-black tracking-tight hidden md:table-cell ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                                        {formatCurrency(coin.quote?.USD?.market_cap || 0)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-24 text-center">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                        <FaSort className={`h-8 w-8 ${isDark ? "text-gray-800" : "text-gray-300"}`} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                                        NO_ENTITIES_DETECTED_IN_SECTOR
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

export default CryptoTable;

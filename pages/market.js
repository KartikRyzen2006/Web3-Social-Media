import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { STOCK_DATA } from "../lib/stockData";
import { useTheme } from "../contexts/ThemeContext";

// Components
import MarketHeader from "../components/Market/MarketHeader";
import CryptoTable from "../components/Market/CryptoTable";
import StockTable from "../components/Market/StockTable";

const CryptoMarket = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [coins, setCoins] = useState([]);
  const [stockQuotes, setStockQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "cmc_rank", direction: "ascending" });
  const [activeTab, setActiveTab] = useState("crypto");

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/market");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch market data");
        }
        const data = await response.json();
        setCoins(data.data || []);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const symbols = STOCK_DATA.map(s => s.yahooSymbol).join(',');
        const response = await fetch(`/api/market/stocks?symbols=${symbols}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch stock data");
        }
        const data = await response.json();
        setStockQuotes(data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "crypto") {
      fetchCryptoData();
    } else {
      fetchStockData();
    }
  }, [activeTab]);

  const handleStockSearch = (e) => {
    e.preventDefault();
    if (!stockSearchTerm) return;
    router.push(`/market/stock/${stockSearchTerm.toUpperCase()}`);
  };

  const filteredStocks = STOCK_DATA.filter(s =>
    s.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
    s.symbol.toLowerCase().includes(stockSearchTerm.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortValue = (coin, key) => {
    if (key === "cmc_rank") return coin.cmc_rank;
    if (key === "name") return coin.name;
    if (key === "price") return coin.quote?.USD?.price || 0;
    if (key === "percent_change_24h") return coin.quote?.USD?.percent_change_24h || 0;
    if (key === "market_cap") return coin.quote?.USD?.market_cap || 0;
    return 0;
  };

  const sortedCoins = [...coins].sort((a, b) => {
    const valA = getSortValue(a, sortConfig.key);
    const valB = getSortValue(b, sortConfig.key);

    if (valA < valB) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredCoins = sortedCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className={`max-w-7xl mx-auto transition-all duration-700 rounded-[2.5rem] shadow-2xl border ${isDark ? "bg-[#0d0b1c]/60 border-white/5 backdrop-blur-2xl" : "bg-white/80 backdrop-blur-xl border-white/20"
      }`}>
      <MarketHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stockSearchTerm={stockSearchTerm}
        setStockSearchTerm={setStockSearchTerm}
        onStockSearch={handleStockSearch}
        theme={theme}
      />

      <div className="p-0">
        {activeTab === "stocks" ? (
          <StockTable
            loading={loading}
            filteredStocks={filteredStocks}
            stockQuotes={stockQuotes}
            formatCurrency={formatCurrency}
            theme={theme}
          />
        ) : (
          <>
            {error && (
              <div className="p-8">
                <div className={`p-8 rounded-[2rem] border text-center animate-in zoom-in duration-500 ${isDark ? "bg-red-500/5 border-red-500/20 text-red-100" : "bg-red-50 text-red-600 border-red-200"
                  }`}>
                  <p className="text-sm font-black uppercase tracking-[0.2em]">ERROR_SYNC_FAILED</p>
                  <p className="text-xs mt-2 opacity-70">{error}</p>
                  <p className="text-[10px] mt-4 font-black uppercase tracking-widest text-red-500 underline cursor-help">
                    PROTOCOL_HINT: ENSURE_CMC_PRO_API_KEY_ENABLED
                  </p>
                </div>
              </div>
            )}

            <CryptoTable
              loading={loading}
              filteredCoins={filteredCoins}
              handleSort={handleSort}
              formatCurrency={formatCurrency}
              theme={theme}
            />

            <div className={`p-6 text-center transition-colors duration-500 ${isDark ? "bg-black/40 border-t border-white/5" : "bg-gray-50/50"}`}>
              <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                DATA_SOURCE://<a href="https://coinmarketcap.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">COINMARKETCAP_API_FEED</a>_v4.1
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CryptoMarket;

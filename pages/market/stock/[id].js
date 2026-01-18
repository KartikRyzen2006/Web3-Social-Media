import { useRouter } from "next/router";
import Link from "next/link";
import TradingViewWidget from "../../../components/TradingViewWidget";
import { STOCK_DATA } from "../../../lib/stockData";
import { FaArrowLeft } from "react-icons/fa";

const StockDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    const stock = STOCK_DATA.find(s => s.id === id) || {
        symbol: id,
        name: id,
        logo: "https://via.placeholder.com/64?text=Stock"
    };

    if (!id) return null;

    const fullSymbol = stock.exchange
        ? `${stock.exchange}:${stock.symbol}`
        : (stock.symbol.includes(':') ? stock.symbol : `NASDAQ:${stock.symbol}`);

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            <div className="py-6">
                <Link href="/market" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Market
                </Link>
            </div>

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center p-2 overflow-hidden border border-gray-100">
                        <img
                            src={stock.logo}
                            alt={stock.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/64?text=" + stock.symbol; }}
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {stock.name}
                            <span className="text-gray-400 text-lg font-medium">{stock.symbol}</span>
                        </h1>
                        <div className="text-sm text-gray-500 font-medium">
                            {stock.exchange} • {stock.type === 'IN' ? 'Indian Market' : 'US Market'}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 h-[700px] overflow-hidden">
                    <TradingViewWidget
                        key={fullSymbol}
                        symbol={fullSymbol}
                    />
                </div>
            </div>
        </div>
    );
};

export default StockDetail;

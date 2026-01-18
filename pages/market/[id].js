import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import TradingViewWidget from "../../components/TradingViewWidget";
import {
    FaGlobe,
    FaFileAlt,
    FaTwitter,
    FaReddit,
    FaArrowLeft,
    FaCaretUp,
    FaCaretDown,
    FaRegStar,
    FaShareAlt
} from "react-icons/fa";

const CryptoDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    const [coin, setCoin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                // 1. Fetch Details (CMC)
                const res = await fetch(`/api/market/detail?id=${id}`);
                if (!res.ok) throw new Error("Failed to load coin details");
                const data = await res.json();
                setCoin(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return "$-.--";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: value < 0.01 ? 6 : 2,
            maximumFractionDigits: value < 0.01 ? 6 : 2,
        }).format(value);
    };

    const formatCompact = (value) => {
        if (!value) return "-";
        return new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 2,
            style: "currency",
            currency: "USD"
        }).format(value);
    };

    const formatNumber = (value) => {
        if (!value) return "-";
        return new Intl.NumberFormat("en-US").format(value);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="text-xl font-bold">Error Loading Coin</h2>
                <p>{error || "Coin not found"}</p>
                <Link href="/market" className="text-blue-500 underline mt-4 block">Back to Market</Link>
            </div>
        )
    }

    const quote = coin.quote?.USD || {};
    const metadata = coin.metadata || {};
    const isPositive = quote.percent_change_24h >= 0;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb / Back */}
            <div className="py-6">
                <Link href="/market" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Market
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Info & Chart */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <img
                                    src={metadata.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                    alt={coin.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                        {coin.name}
                                        <span className="text-gray-400 text-lg font-medium">{coin.symbol}</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                                            Rank #{coin.cmc_rank}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-yellow-400 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <FaRegStar />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <FaShareAlt />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex items-end gap-4">
                            <div className="text-5xl font-extrabold text-gray-900">
                                {formatCurrency(quote.price)}
                            </div>
                            <div className={`flex items-center px-2 py-1 rounded-lg text-lg font-semibold mb-2 ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {isPositive ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
                                {Math.abs(quote.percent_change_24h).toFixed(2)}% (24h)
                            </div>
                        </div>
                    </div>

                    {/* TradingView Chart Card */}
                    <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 h-[600px] overflow-hidden">
                        <TradingViewWidget symbol={coin.symbol} />
                    </div>

                    {/* Read More Section (Description) */}
                    {metadata.description && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">About {coin.name}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {metadata.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Stats & Links */}
                <div className="space-y-6">

                    {/* Market Stats */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Market Stats</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Market Cap</span>
                                <span className="font-semibold text-gray-900">{formatCompact(quote.market_cap)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Volume (24h)</span>
                                <span className="font-semibold text-gray-900">{formatCompact(quote.volume_24h)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Circulating Supply</span>
                                <div className="text-right">
                                    <span className="font-semibold text-gray-900 block">{formatNumber(coin.circulating_supply)} {coin.symbol}</span>
                                </div>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Total Supply</span>
                                <span className="font-semibold text-gray-900">{formatNumber(coin.total_supply)} {coin.symbol}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Max Supply</span>
                                <span className="font-semibold text-gray-900">{coin.max_supply ? formatNumber(coin.max_supply) : '∞'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Fully Diluted Value</span>
                                <span className="font-semibold text-gray-900">{formatCompact(quote.fully_diluted_market_cap)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Official Links */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Official Links</h3>
                        <div className="space-y-3">
                            {metadata.urls?.website?.[0] && (
                                <a href={metadata.urls.website[0]} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                                    <FaGlobe className="mr-3 text-blue-500" /> Website
                                </a>
                            )}
                            {metadata.urls?.technical_doc?.[0] && (
                                <a href={metadata.urls.technical_doc[0]} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                                    <FaFileAlt className="mr-3 text-gray-500" /> Whitepaper
                                </a>
                            )}
                            {metadata.urls?.twitter?.[0] && (
                                <a href={metadata.urls.twitter[0]} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                                    <FaTwitter className="mr-3 text-blue-400" /> Twitter
                                </a>
                            )}
                            {metadata.urls?.reddit?.[0] && (
                                <a href={metadata.urls.reddit[0]} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                                    <FaReddit className="mr-3 text-orange-500" /> Reddit
                                </a>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
};

export default CryptoDetail;

import React, { useEffect, useRef, memo } from 'react';

const MarketOverviewWidget = ({ colorTheme = "light", dateRange = "12M", showChart = true, largeChartUrl = "", isTransparent = false, showSymbolLogo = true, showFloatingTooltip = false, width = "100%", height = "660", plotLineColorGrowing = "rgba(41, 98, 255, 1)", plotLineColorFalling = "rgba(41, 98, 255, 1)", gridLineColor = "rgba(240, 243, 250, 0)", scaleFontColor = "rgba(106, 109, 120, 1)", belowLineFillColorGrowing = "rgba(41, 98, 255, 0.12)", belowLineFillColorFalling = "rgba(41, 98, 255, 0.12)", belowLineFillColorGrowingBottom = "rgba(41, 98, 255, 0)", belowLineFillColorFallingBottom = "rgba(41, 98, 255, 0)", symbolActiveColor = "rgba(41, 98, 255, 0.12)", tabs }) => {
    const container = useRef();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": colorTheme,
            "dateRange": dateRange,
            "showChart": showChart,
            "locale": "en",
            "largeChartUrl": largeChartUrl,
            "isTransparent": isTransparent,
            "showSymbolLogo": showSymbolLogo,
            "showFloatingTooltip": showFloatingTooltip,
            "width": width,
            "height": height,
            "plotLineColorGrowing": plotLineColorGrowing,
            "plotLineColorFalling": plotLineColorFalling,
            "gridLineColor": gridLineColor,
            "scaleFontColor": scaleFontColor,
            "belowLineFillColorGrowing": belowLineFillColorGrowing,
            "belowLineFillColorFalling": belowLineFillColorFalling,
            "belowLineFillColorGrowingBottom": belowLineFillColorGrowingBottom,
            "belowLineFillColorFallingBottom": belowLineFillColorFallingBottom,
            "symbolActiveColor": symbolActiveColor,
            "tabs": tabs
        });

        container.current.innerHTML = "";
        container.current.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};

const StockMarket = () => {
    return (
        <div className="space-y-8">
            {/* US & Global Stocks Section */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">🇺🇸 US & Global Markets</h2>
                <MarketOverviewWidget
                    tabs={[
                        {
                            "title": "Indices",
                            "symbols": [
                                { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                                { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
                                { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                                { "s": "INDEX:NKY", "d": "Nikkei 225" },
                                { "s": "INDEX:DEU40", "d": "DAX Index" },
                                { "s": "FOREXCOM:UKXGBP", "d": "UK 100" }
                            ],
                            "originalTitle": "Indices"
                        },
                        {
                            "title": "Tech Giants",
                            "symbols": [
                                { "s": "NASDAQ:AAPL", "d": "Apple" },
                                { "s": "NASDAQ:NVDA", "d": "Nvidia" },
                                { "s": "NASDAQ:MSFT", "d": "Microsoft" },
                                { "s": "NASDAQ:GOOGL", "d": "Google" },
                                { "s": "NASDAQ:AMZN", "d": "Amazon" },
                                { "s": "NASDAQ:META", "d": "Meta" },
                                { "s": "NASDAQ:TSLA", "d": "Tesla" }
                            ]
                        }
                    ]}
                />
            </div>

            {/* Indian Stocks Section */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">🇮🇳 Indian Markets</h2>
                <MarketOverviewWidget
                    tabs={[
                        {
                            "title": "Indices",
                            "symbols": [
                                { "s": "NSE:NIFTY", "d": "Nifty 50" },
                                { "s": "BSE:SENSEX", "d": "Sensex" },
                                { "s": "NSE:BANKNIFTY", "d": "Bank Nifty" },
                                { "s": "NSE:NIFTYIT", "d": "Nifty IT" }
                            ],
                            "originalTitle": "Indices"
                        },
                        {
                            "title": "Top Stocks",
                            "symbols": [
                                { "s": "NSE:RELIANCE", "d": "Reliance" },
                                { "s": "NSE:TCS", "d": "TCS" },
                                { "s": "NSE:HDFCBANK", "d": "HDFC Bank" },
                                { "s": "NSE:INFY", "d": "Infosys" },
                                { "s": "NSE:ICICIBANK", "d": "ICICI Bank" },
                                { "s": "NSE:SBIN", "d": "SBI" }
                            ]
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default memo(StockMarket);

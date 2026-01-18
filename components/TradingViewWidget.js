// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol }) {
    const container = useRef();

    useEffect(
        () => {
            if (!symbol) return;

            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            const finalSymbol = symbol.includes(':') ? symbol : `BINANCE:${symbol.toUpperCase()}USDT`;

            script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${finalSymbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;

            // Clear previous content
            container.current.innerHTML = "";
            container.current.appendChild(script);
        },
        [symbol]
    );

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
    );
}

export default memo(TradingViewWidget);

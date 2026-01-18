
export default async function handler(req, res) {
    const { slug, days = "7" } = req.query;

    if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
    }

    try {
        // Strategy: Try using the CMC slug as the CoinGecko ID directly.
        // Most top coins match: 'bitcoin' -> 'bitcoin', 'ethereum' -> 'ethereum'.
        let cgId = slug.toLowerCase();

        // Mapping overrides for known mismatches if needed (can be expanded)
        const manualMapping = {
            "bnb": "binancecoin",
            "xrp": "ripple",
            "dogecoin": "dogecoin",
            "cardano": "cardano",
            "solana": "solana",
            "polkadot": "polkadot",
            "shiba-inu": "shiba-inu",
            "avalanche": "avalanche-2",
            "tron": "tron",
            "uniswap": "uniswap",
            "chainlink": "chainlink",
            "leo-token": "leo-token",
            "litecoin": "litecoin",
            "near-protocol": "near",
            "polygon": "matic-network",
            "dai": "dai",
            "bitcoin-cash": "bitcoin-cash"
        };

        if (manualMapping[cgId]) {
            cgId = manualMapping[cgId];
        }

        const fetchChart = async (id, dayParam) => {
            const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${dayParam}`;
            const r = await fetch(url);
            if (!r.ok) throw new Error(r.statusText);
            return r.json();
        };

        let chartData;
        try {
            // Try direct fetch
            chartData = await fetchChart(cgId, days);
        } catch (e) {
            console.log(`Direct fetch failed for ${cgId}, trying search...`);
            // Fallback: Search by slug (treating it as name/symbol)
            const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${slug}`);
            const searchData = await searchRes.json();
            const match = searchData.coins?.[0]; // Best guess

            if (match) {
                chartData = await fetchChart(match.id, days);
            } else {
                throw new Error("Coin not found via search");
            }
        }

        res.status(200).json(chartData.prices || []);

    } catch (error) {
        console.error("Chart Proxy Error:", error);
        res.status(200).json([]);
    }
}

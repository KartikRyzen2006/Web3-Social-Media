
export default async function handler(req, res) {
    const { id } = req.query;
    const API_KEY = process.env.CMC_PRO_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "CMC_PRO_API_KEY is not configured" });
    }

    if (!id) {
        return res.status(400).json({ error: "Coin ID is required" });
    }

    try {
        // 1. Get Latest Quote
        const quoteResponse = await fetch(
            `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}&convert=USD`,
            {
                headers: {
                    "X-CMC_PRO_API_KEY": API_KEY,
                    "Accept": "application/json",
                },
            }
        );

        if (!quoteResponse.ok) {
            const errorText = await quoteResponse.text();
            throw new Error(`CMC Quote API Failed: ${errorText}`);
        }

        const quoteData = await quoteResponse.json();

        // 2. Get Metadata (Logo, Description, Website)
        const infoResponse = await fetch(
            `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${id}`,
            {
                headers: {
                    "X-CMC_PRO_API_KEY": API_KEY,
                    "Accept": "application/json",
                },
            }
        );

        let infoData = {};
        if (infoResponse.ok) {
            infoData = await infoResponse.json();
        } else {
            console.warn("CMC Info API Failed, proceeding with minimal data");
        }

        // Combine data
        const coinQuote = quoteData.data[id];
        const coinInfo = infoData.data ? infoData.data[id] : {};

        res.status(200).json({
            ...coinQuote,
            metadata: coinInfo
        });

    } catch (error) {
        console.error("CoinMarketCap Detail API Error:", error);
        res.status(500).json({ error: error.message });
    }
}


export default async function handler(req, res) {
    const API_KEY = process.env.CMC_PRO_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "CMC_PRO_API_KEY is not configured" });
    }

    try {
        const response = await fetch(
            "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD",
            {
                headers: {
                    "X-CMC_PRO_API_KEY": API_KEY,
                    "Accept": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.status?.error_message || "Failed to fetch data from CMC");
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("CoinMarketCap API Error:", error);
        res.status(500).json({ error: error.message });
    }
}

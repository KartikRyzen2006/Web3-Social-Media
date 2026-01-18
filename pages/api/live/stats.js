import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'live-stats.json');

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        views: 1247,
        likes: 89,
        likedUsers: [],
        chatMessages: [],
        currentStream: {
            url: "",
            isLive: false,
            title: "Waiting for stream...",
            streamerAddress: null
        }
    };
    try {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData));
    } catch (e) { console.error("Init DB failed", e); }
}

const getStats = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Read DB failed", error);
        return {};
    }
};

const saveStats = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Write DB failed", error);
    }
};

export default function handler(req, res) {
    let stats = getStats();

    if (req.method === 'GET') {
        return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
        const { action, url, title, userAddress, message } = req.body;

        if (action === 'start_stream') {
            stats.currentStream = {
                url: url,
                isLive: true,
                title: title || "Live Stream",
                streamerAddress: userAddress
            };
            // Reset for new stream
            stats.views = 0;
            stats.likes = 0;
            stats.likedUsers = [];
            stats.chatMessages = [];
            saveStats(stats);
            return res.status(200).json({ success: true, ...stats });
        }

        if (action === 'end_stream') {
            if (stats.currentStream.streamerAddress && stats.currentStream.streamerAddress !== userAddress) {
                return res.status(403).json({ error: "Only the streamer can end the stream" });
            }
            stats.currentStream.isLive = false;
            stats.currentStream.streamerAddress = null;
            stats.chatMessages = []; // Clear chat on end stream
            saveStats(stats);
            return res.status(200).json({ success: true, ...stats });
        }

        if (action === 'view') {
            stats.views = (stats.views || 0) + 1;
            saveStats(stats);
            return res.status(200).json({ success: true, ...stats });
        }

        if (action === 'like') {
            if (userAddress && stats.likedUsers && stats.likedUsers.includes(userAddress)) {
                return res.status(400).json({ error: "User already liked", ...stats });
            }

            if (userAddress) {
                if (!stats.likedUsers) stats.likedUsers = [];
                stats.likedUsers.push(userAddress);
            }

            stats.likes = (stats.likes || 0) + 1;
            saveStats(stats);
            return res.status(200).json({ success: true, ...stats });
        }

        if (action === 'chat') {
            const newMessage = {
                id: Date.now(),
                user: userAddress || "Anonymous",
                text: message,
                timestamp: new Date().toISOString()
            };
            if (!stats.chatMessages) stats.chatMessages = [];
            stats.chatMessages.push(newMessage);
            if (stats.chatMessages.length > 50) {
                stats.chatMessages.shift();
            }
            saveStats(stats);
            return res.status(200).json({ success: true, ...stats });
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
